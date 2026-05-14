import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma, Role, WeightUnit, LengthUnit } from '@fitsync/database';

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

  async updateUserProfile(
    userId: string,
    payload: {
      fullName?: string;
      bio?: string;
      weightUnit?: WeightUnit;
      lengthUnit?: LengthUnit;
      notificationLeadMinutes?: number | string;
    },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.user.update({
      where: { id: userId },
      data: {
        fullName: payload.fullName,
        bio: payload.bio,
        weightUnit: payload.weightUnit,
        lengthUnit: payload.lengthUnit,
        notificationLeadMinutes: payload.notificationLeadMinutes
          ? parseInt(String(payload.notificationLeadMinutes), 10)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        bio: true,
        role: true,
        weightUnit: true,
        lengthUnit: true,
        notificationLeadMinutes: true,
        updatedAt: true,
      },
    });
  }

  async deleteAccount(userId: string) {
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
}
