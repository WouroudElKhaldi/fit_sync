import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';
import { CreateWorkoutPlanSchema } from '@fitsync/shared-types';

@Injectable()
export class WorkoutService {
  async createPlan(trainerId: string, payload: unknown) {
    const validationResult = CreateWorkoutPlanSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new BadRequestException({
        message: 'Invalid workout plan payload schema',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const data = validationResult.data;

    const client = await prisma.user.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new NotFoundException('Assigned client profile not found');
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        title: data.title,
        description: data.description,
        scheduledDate: data.scheduledDate
          ? new Date(data.scheduledDate)
          : undefined,
        isRecurring: data.isRecurring ?? false,
        recurrenceRule: data.recurrenceRule,
        createdById: trainerId,
        clientId: data.clientId,
        exercises: {
          create: data.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            restTimeSec: ex.restTimeSec,
            notes: ex.notes,
            sets: {
              create: ex.sets.map((s) => ({
                setIndex: s.setIndex,
                expectedReps: s.expectedReps,
                expectedWeight: s.expectedWeight,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return {
      message: 'Workout plan template constructed successfully',
      plan,
    };
  }

  async getClientPlans(clientId: string) {
    return prisma.workoutPlan.findMany({
      where: { clientId },
      include: {
        createdBy: {
          select: { fullName: true, role: true },
        },
        exercises: {
          include: {
            exercise: {
              select: { name: true, equipment: true },
            },
            sets: {
              orderBy: { setIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        session: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async getPlanById(planId: string) {
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: planId },
      include: {
        createdBy: { select: { fullName: true } },
        client: { select: { fullName: true } },
        exercises: {
          include: {
            exercise: {
              include: {
                equipment: true,
                muscles: {
                  include: { muscle: true },
                },
              },
            },
            sets: { orderBy: { setIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
        session: {
          include: { loggedSets: { orderBy: { setIndex: 'asc' } } },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan template not found');
    }

    return plan;
  }

  async getVolumeAnalytics(clientId: string) {
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        weeklyGoalDays: true,
        weeklyGoalHours: true,
        weeklyGoalCalories: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all completed sessions for this client
    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutPlan: { clientId },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
        totalVolume: true,
        caloriesBurned: true,
        workoutPlan: { select: { title: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Calculate weekly metrics
    // A proper implementation would filter by the current week. 
    // For now, we'll aggregate recent sessions (e.g., last 7 days).
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let activeCalories = 0;
    let weeklyTimeHours = 0;
    let totalSessionsThisWeek = 0;

    sessions.forEach((s) => {
      if (s.completedAt && s.completedAt >= oneWeekAgo) {
        totalSessionsThisWeek++;
        activeCalories += s.caloriesBurned || 0;
        const durationHours = (s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60 * 60);
        weeklyTimeHours += durationHours;
      }
    });

    // Map to a format suitable for charts
    const volumeData = sessions.map((s) => ({
      date: s.completedAt,
      volume: s.totalVolume,
      workout: s.workoutPlan.title,
    }));

    return {
      volumeData,
      summary: {
        activeCalories: Math.round(activeCalories),
        weeklyTimeHours: Number(weeklyTimeHours.toFixed(1)),
        totalSessionsThisWeek,
        weeklyGoalDays: user.weeklyGoalDays,
        weeklyGoalHours: user.weeklyGoalHours,
        weeklyGoalCalories: user.weeklyGoalCalories,
      },
    };
  }

  async getTrainerPlans(trainerId: string) {
    const user = await prisma.user.findUnique({
      where: { id: trainerId },
    });

    const whereClause =
      user && user.role === 'ADMIN' ? undefined : { createdById: trainerId };

    return prisma.workoutPlan.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, fullName: true, email: true },
        },
        exercises: {
          include: {
            exercise: {
              select: { name: true, equipment: true },
            },
            sets: {
              orderBy: { setIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        session: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }
}
