import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma, Role, WeightUnit, LengthUnit } from '@fitsync/database';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  // ─── Profile ─────────────────────────────────────────────────────────────

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainerProfile: true,
        trainer: { select: { id: true, fullName: true, email: true } },
        clients: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async adminCreateUser(
    adminId: string,
    payload: {
      email: string;
      username: string;
      fullName: string;
      role: Role;
      password?: string;
    },
  ) {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.ADMIN) {
      throw new BadRequestException('Unauthorized. Admin privilege required.');
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: payload.email }, { username: payload.username }] },
    });
    if (existing)
      throw new BadRequestException('Email or username already exists');

    const salt = 'fitsync-secure-salt-2026';
    const password = payload.password || 'Password123!';
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

    return prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        fullName: payload.fullName,
        passwordHash,
        role: payload.role,
        isVerified: true,
      },
    });
  }

  async updateUserProfile(
    userId: string,
    payload: {
      fullName?: string;
      email?: string;
      username?: string;
      bio?: string;
      weightUnit?: WeightUnit;
      lengthUnit?: LengthUnit;
      notificationLeadMinutes?: number | string;
      weeklyGoalDays?: number;
      weeklyGoalHours?: number;
      weeklyGoalCalories?: number;
      role?: Role;
      trainerProfile?: {
        education?: string;
        certifications?: string[];
        specialties?: string[];
        bio?: string;
      };
      password?: string;
    },
    callerId?: string,
  ) {
    if (callerId && callerId !== userId) {
      const caller = await prisma.user.findUnique({ where: { id: callerId } });
      if (!caller || caller.role !== Role.ADMIN) {
        throw new BadRequestException(
          'Unauthorized to modify another user profile.',
        );
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (payload.email) {
      const existing = await prisma.user.findFirst({
        where: { email: payload.email, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Email already exists');
    }

    if (payload.username) {
      const existing = await prisma.user.findFirst({
        where: { username: payload.username, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Username already exists');
    }

    const dataToUpdate: any = {
      fullName: payload.fullName,
      email: payload.email,
      username: payload.username,
      bio: payload.bio,
      weightUnit: payload.weightUnit,
      lengthUnit: payload.lengthUnit,
      notificationLeadMinutes: payload.notificationLeadMinutes
        ? parseInt(String(payload.notificationLeadMinutes), 10)
        : undefined,
      weeklyGoalDays: payload.weeklyGoalDays !== undefined ? parseInt(String(payload.weeklyGoalDays), 10) : undefined,
      weeklyGoalHours: payload.weeklyGoalHours !== undefined ? parseFloat(String(payload.weeklyGoalHours)) : undefined,
      weeklyGoalCalories: payload.weeklyGoalCalories !== undefined ? parseFloat(String(payload.weeklyGoalCalories)) : undefined,
      trainerProfile: payload.trainerProfile
        ? {
            upsert: {
              create: {
                education: payload.trainerProfile.education || '',
                certifications: payload.trainerProfile.certifications || [],
                specialties: payload.trainerProfile.specialties || [],
                bio: payload.trainerProfile.bio || payload.bio || '',
              },
              update: {
                education: payload.trainerProfile.education,
                certifications: payload.trainerProfile.certifications,
                specialties: payload.trainerProfile.specialties,
                bio: payload.trainerProfile.bio || payload.bio,
              },
            },
          }
        : undefined,
    };

    if (payload.password) {
      if (typeof payload.password !== 'string' || payload.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      // Check caller permission
      if (callerId && callerId !== userId) {
        const caller = await prisma.user.findUnique({ where: { id: callerId } });
        if (!caller || caller.role !== Role.ADMIN) {
          throw new BadRequestException('Unauthorized to modify another user password.');
        }
      }

      const salt = 'fitsync-secure-salt-2026';
      dataToUpdate.passwordHash = crypto.scryptSync(payload.password, salt, 64).toString('hex');
    }

    if (callerId) {
      const caller = await prisma.user.findUnique({ where: { id: callerId } });
      if (caller && caller.role === Role.ADMIN && payload.role) {
        dataToUpdate.role = payload.role;
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        role: true,
        weightUnit: true,
        lengthUnit: true,
        notificationLeadMinutes: true,
        updatedAt: true,
        trainerProfile: true,
      },
    });
  }

  async deleteAccount(userId: string, callerId?: string) {
    if (callerId && callerId !== userId) {
      const caller = await prisma.user.findUnique({ where: { id: callerId } });
      if (!caller || caller.role !== Role.ADMIN) {
        throw new BadRequestException('Unauthorized to delete another user.');
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Account permanently deleted', success: true };
  }

  // ─── Trainer Assignment ───────────────────────────────────────────────────

  async assignTrainer(clientId: string, trainerId: string) {
    const [client, trainer] = await Promise.all([
      prisma.user.findUnique({ where: { id: clientId } }),
      prisma.user.findUnique({ where: { id: trainerId } }),
    ]);
    if (!client) throw new NotFoundException('Client not found');
    if (!trainer) throw new NotFoundException('Trainer not found');
    if (trainer.role !== Role.TRAINER) {
      throw new BadRequestException('Target user is not a registered trainer');
    }
    return prisma.user.update({
      where: { id: clientId },
      data: { trainerId },
      select: { id: true, fullName: true, trainerId: true },
    });
  }

  async removeTrainer(clientId: string) {
    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');
    return prisma.user.update({
      where: { id: clientId },
      data: { trainerId: null },
      select: { id: true, fullName: true, trainerId: true },
    });
  }

  // ─── Admin: List All Users ─────────────────────────────────────────────────

  async listAllUsers(role?: string) {
    return prisma.user.findMany({
      where: role ? { role: role as Role } : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        trainerId: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string, callerId: string) {
    if (!query) return { users: [], workouts: [] };

    const caller = await prisma.user.findUnique({ where: { id: callerId } });
    if (!caller) return { users: [], workouts: [] };

    let userWhere: any = {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (caller.role === Role.TRAINER) {
      userWhere = {
        AND: [
          userWhere,
          { trainerId: callerId },
        ],
      };
    } else if (caller.role === Role.USER) {
      userWhere = {
        AND: [
          userWhere,
          { OR: [{ id: callerId }, { id: caller.trainerId || '' }] },
        ],
      };
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    let planWhere: any = {
      title: { contains: query, mode: 'insensitive' },
    };
    if (caller.role === Role.TRAINER) {
      planWhere = {
        AND: [
          planWhere,
          { createdById: callerId },
        ],
      };
    } else if (caller.role === Role.USER) {
      planWhere = {
        AND: [
          planWhere,
          { clientId: callerId },
        ],
      };
    }

    const workouts = await prisma.workoutPlan.findMany({
      where: planWhere,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      take: 10,
    });

    return { users, workouts };
  }

  async getNotifications(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const notificationsList: any[] = [];

    const unreadMessages = await prisma.message.findMany({
      where: { receiverId: userId, isRead: false },
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
    });

    const leadMinutes = user.notificationLeadMinutes || 60;
    const now = new Date();
    const futureLimit = new Date(now.getTime() + leadMinutes * 60000);

    // Fetch persistent notifications
    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Generate dynamic upcoming workout reminders
    const upcomingWorkouts = await prisma.workoutPlan.findMany({
      where: {
        clientId: userId,
        scheduledDate: {
          gt: now,
          lte: futureLimit,
        },
        session: null, // Only workouts that haven't been completed
      },
    });

    const reminderNotifications = upcomingWorkouts.map((w) => ({
      id: `reminder-${w.id}`,
      title: 'Upcoming Workout Reminder',
      message: `Your workout "${w.title}" is scheduled in less than ${leadMinutes} minutes!`,
      type: 'REMINDER',
      isRead: false,
      createdAt: w.scheduledDate || now,
    }));

    const allNotifications = [...reminderNotifications, ...dbNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return allNotifications.map(n => ({
      id: n.id,
      title: n.title,
      body: n.message,
      time: n.createdAt,
      read: n.isRead,
      type: n.type,
      icon: n.type === 'REMINDER' ? 'alarm' : n.type === 'NEW_MESSAGE' ? 'chat' : 'notifications'
    }));
  }
}
