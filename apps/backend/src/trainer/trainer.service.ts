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
    // Ensure this client actually maps to the request professional coach
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        trainerId,
      },
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
}
