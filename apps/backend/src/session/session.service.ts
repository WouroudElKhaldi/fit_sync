import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';
import { SetStatus } from '@fitsync/shared-types';

@Injectable()
export class SessionService {
  async startSession(workoutPlanId: string) {
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
      include: {
        session: true,
        exercises: {
          include: { sets: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan template not found');
    }

    if (plan.session) {
      throw new ConflictException(
        'An active training session already maps to this planned schedule',
      );
    }

    const session = await prisma.workoutSession.create({
      data: {
        workoutPlanId,
      },
    });

    const setIds: string[] = [];
    for (const ex of plan.exercises) {
      for (const s of ex.sets) {
        setIds.push(s.id);
      }
    }

    if (setIds.length > 0) {
      await prisma.workoutSet.updateMany({
        where: { id: { in: setIds } },
        data: { workoutSessionId: session.id },
      });
    }

    return prisma.workoutSession.findUnique({
      where: { id: session.id },
      include: {
        workoutPlan: {
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: { orderBy: { setIndex: 'asc' } },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });
  }

  async updateSetExecution(
    setId: string,
    payload: {
      actualReps?: number;
      actualWeight?: number;
      status?: SetStatus;
    },
  ) {
    const targetSet = await prisma.workoutSet.findUnique({
      where: { id: setId },
    });

    if (!targetSet) {
      throw new NotFoundException('Target workout set not found');
    }

    return prisma.workoutSet.update({
      where: { id: setId },
      data: {
        actualReps: payload.actualReps,
        actualWeight: payload.actualWeight,
        status: payload.status || undefined,
      },
    });
  }

  async completeSession(sessionId: string, payload: { clientNotes?: string }) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        loggedSets: true,
        workoutPlan: {
          include: {
            client: {
              select: { weightUnit: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Active workout session instance not found');
    }

    if (session.completedAt) {
      throw new BadRequestException(
        'Workout session is already marked complete',
      );
    }

    let totalVolume = 0;
    for (const s of session.loggedSets) {
      if (s.status === 'SKIPPED') continue;
      
      const weight = s.actualWeight ?? s.expectedWeight;
      const reps = s.actualReps ?? s.expectedReps;
      totalVolume += weight * reps;
    }

    return prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        totalVolume,
        clientNotes: payload.clientNotes,
      },
      include: {
        loggedSets: {
          orderBy: { setIndex: 'asc' },
        },
      },
    });
  }

  async getSession(sessionId: string) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        workoutPlan: { select: { id: true, title: true, clientId: true } },
        loggedSets: { orderBy: { setIndex: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getSessionByPlan(planId: string) {
    const session = await prisma.workoutSession.findUnique({
      where: { workoutPlanId: planId },
      include: {
        loggedSets: { orderBy: { setIndex: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('No session found for this plan');
    return session;
  }

  async getSessionHistory(clientId: string) {
    return prisma.workoutSession.findMany({
      where: {
        workoutPlan: { clientId },
      },
      include: {
        workoutPlan: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async submitTrainerFeedback(
    sessionId: string,
    payload: { trainerFeedback?: string; trainerRating?: number },
  ) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (payload.trainerRating !== undefined) {
      if (payload.trainerRating < 1 || payload.trainerRating > 5) {
        throw new BadRequestException('trainerRating must be between 1 and 5');
      }
    }

    return prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        trainerFeedback: payload.trainerFeedback,
        trainerRating: payload.trainerRating,
      },
    });
  }
}

