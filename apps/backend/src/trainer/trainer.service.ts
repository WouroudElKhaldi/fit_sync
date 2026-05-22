import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class TrainerService {
  async getClients(trainerId: string) {
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      include: {
        clients: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            createdAt: true,
            biometrics: {
              orderBy: { loggedAt: 'desc' },
              take: 1, // Preview latest weight measurement
            },
            workoutPlans: {
              include: {
                session: { select: { totalVolume: true, completedAt: true } },
              },
              orderBy: { scheduledDate: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer account profile not found');
    }

    return trainer.clients;
  }

  async getClientProgress(trainerId: string, clientId: string) {
    // Check if the requesting user is an Admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: trainerId },
    });
    const isTrainerAdmin = requestingUser?.role === 'ADMIN';

    // Ensure this client actually maps to the request professional coach (unless admin)
    const client = await prisma.user.findFirst({
      where: isTrainerAdmin
        ? { id: clientId }
        : { id: clientId, trainerId },
      include: {
        biometrics: {
          orderBy: { loggedAt: 'asc' }, // Order chronologically to draw trendlines
        },
        workoutPlans: {
          include: {
            session: {
              include: {
                loggedSets: {
                  include: { workoutExercise: { include: { exercise: true } } },
                },
              },
            },
          },
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(
        'Client profile not found or not assigned to this professional trainer',
      );
    }

    return {
      client: {
        id: client.id,
        fullName: client.fullName,
        email: client.email,
        weightUnit: client.weightUnit,
        lengthUnit: client.lengthUnit,
      },
      biometricsTimeline: client.biometrics,
      trainingSessions: client.workoutPlans
        .filter((p) => p.session?.completedAt)
        .map((p) => ({
          planId: p.id,
          title: p.title,
          scheduledDate: p.scheduledDate,
          completedAt: p.session?.completedAt,
          totalVolume: p.session?.totalVolume,
          clientNotes: p.session?.clientNotes,
        })),
    };
  }

  async getDashboardStats(trainerId: string) {
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      include: {
        clients: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer account profile not found');
    }

    const totalClients = trainer.clients.length;

    // Workouts created/scheduled this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const workoutsThisWeek = await prisma.workoutPlan.count({
      where: {
        createdById: trainerId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    // Completed sessions this week for this trainer's clients
    const clientIds = trainer.clients.map((c) => c.id);
    const completedSessionsThisWeek = await prisma.workoutSession.count({
      where: {
        workoutPlan: {
          clientId: { in: clientIds },
        },
        completedAt: { gte: oneWeekAgo },
      },
    });

    // Pending session reviews (completed sessions where trainerRating or trainerFeedback is null)
    const pendingFeedbackCount = await prisma.workoutSession.count({
      where: {
        workoutPlan: {
          clientId: { in: clientIds },
        },
        completedAt: { not: null },
        OR: [{ trainerFeedback: null }, { trainerRating: null }],
      },
    });

    // Last 5 completed sessions as recent activity
    const recentCompletedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutPlan: {
          clientId: { in: clientIds },
        },
        completedAt: { not: null },
      },
      include: {
        workoutPlan: {
          select: {
            title: true,
            client: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    const recentActivity = recentCompletedSessions.map((s) => ({
      sessionId: s.id,
      planTitle: s.workoutPlan.title,
      clientName: s.workoutPlan.client.fullName,
      clientId: s.workoutPlan.client.id,
      completedAt: s.completedAt,
      totalVolume: s.totalVolume,
    }));

    return {
      totalClients,
      workoutsThisWeek,
      completedSessionsThisWeek,
      pendingFeedbackCount,
      recentActivity,
    };
  }

  async getTrainerAnalytics(trainerId: string) {
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      include: {
        clients: { select: { id: true } },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const clientIds = trainer.clients.map((c) => c.id);

    // Get completed sessions of the last 30 days to aggregate volume
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutPlan: {
          clientId: { in: clientIds },
        },
        completedAt: { gte: thirtyDaysAgo },
      },
      select: {
        completedAt: true,
        totalVolume: true,
        workoutPlan: { select: { title: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Simple date grouping for charts
    const volumeTimeline = sessions.map((s) => ({
      date: s.completedAt,
      volume: s.totalVolume,
      workoutTitle: s.workoutPlan.title,
    }));

    return {
      volumeTimeline,
      summary30Days: {
        totalSessionsCompleted: sessions.length,
        totalVolumeLifted: sessions.reduce(
          (acc, curr) => acc + curr.totalVolume,
          0,
        ),
      },
    };
  }
}
