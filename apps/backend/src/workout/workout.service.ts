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
    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutPlan: { clientId },
        completedAt: { not: null },
      },
      select: {
        completedAt: true,
        totalVolume: true,
        workoutPlan: { select: { title: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Map to a format suitable for charts
    return sessions.map((s) => ({
      date: s.completedAt,
      volume: s.totalVolume,
      workout: s.workoutPlan.title,
    }));
  }
}
