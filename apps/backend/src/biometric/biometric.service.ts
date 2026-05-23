import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class BiometricService {
  // User: log a new weight/height reading
  async logBiometric(
    userId: string,
    payload: { weight?: number; height?: number; bodyFat?: number; leanMass?: number },
  ) {
    if (!payload.weight) {
      throw new BadRequestException('weight is required');
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.biometricLog.create({
      data: {
        userId,
        weight: payload.weight,
        height: payload.height,
        bodyFat: payload.bodyFat,
        leanMass: payload.leanMass,
      },
    });
  }

  // User/Trainer: get full biometric history timeline for a user
  async getBiometricHistory(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.biometricLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'asc' },
    });
  }

  // User: get their most recent biometric entry
  async getLatestBiometric(userId: string) {
    const entry = await prisma.biometricLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });
    if (!entry) {
      throw new NotFoundException('No biometric records found for this user');
    }
    return entry;
  }

  // User/Admin: delete a specific biometric log entry
  async deleteBiometricLog(logId: string) {
    const entry = await prisma.biometricLog.findUnique({
      where: { id: logId },
    });
    if (!entry) throw new NotFoundException('Biometric log entry not found');
    await prisma.biometricLog.delete({ where: { id: logId } });
    return { message: 'Biometric log entry deleted', success: true };
  }

  // User: log personal record
  async logPersonalRecord(userId: string, exerciseId: string, payload: { weight: number; reps?: number }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Exercise not found');

    return prisma.personalRecord.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId }
      },
      update: {
        weight: payload.weight,
        reps: payload.reps,
        achievedAt: new Date(),
      },
      create: {
        userId,
        exerciseId,
        weight: payload.weight,
        reps: payload.reps,
      }
    });
  }

  // User: get all personal records
  async getPersonalRecords(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.personalRecord.findMany({
      where: { userId },
      include: {
        exercise: true
      },
      orderBy: { achievedAt: 'desc' },
    });
  }
}
