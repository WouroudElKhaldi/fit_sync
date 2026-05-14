/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class ExerciseAdminService {
  // ─── Exercise CRUD ────────────────────────────────────────────────────────

  async createExercise(payload: Record<string, any>) {
    if (!payload.name) {
      throw new BadRequestException('Exercise name is required');
    }
    const existing = await prisma.exercise.findUnique({
      where: { name: payload.name },
    });
    if (existing) {
      throw new ConflictException('An exercise with this name already exists');
    }

    return prisma.exercise.create({
      data: {
        name: payload.name,
        description: payload.description,
        steps: payload.steps || [],
        equipmentId: payload.equipmentId || null,
      },
      include: { equipment: true, muscles: { include: { muscle: true } } },
    });
  }

  async updateExercise(exerciseId: string, payload: Record<string, any>) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) throw new NotFoundException('Exercise not found');

    return prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        name: payload.name,
        description: payload.description,
        steps: payload.steps,
        equipmentId: payload.equipmentId,
      },
      include: { equipment: true, muscles: { include: { muscle: true } } },
    });
  }

  async deleteExercise(exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) throw new NotFoundException('Exercise not found');
    await prisma.exercise.delete({ where: { id: exerciseId } });
    return { message: 'Exercise deleted from dictionary', success: true };
  }

  // ─── Muscle Target Mappings ───────────────────────────────────────────────

  async addMuscleTarget(
    exerciseId: string,
    muscleId: string,
    targetType: 'PRIMARY' | 'SECONDARY',
  ) {
    const [exercise, muscle] = await Promise.all([
      prisma.exercise.findUnique({ where: { id: exerciseId } }),
      prisma.muscle.findUnique({ where: { id: muscleId } }),
    ]);
    if (!exercise) throw new NotFoundException('Exercise not found');
    if (!muscle) throw new NotFoundException('Muscle not found');

    const existing = await prisma.exerciseMuscle.findUnique({
      where: { exerciseId_muscleId: { exerciseId, muscleId } },
    });
    if (existing) {
      throw new ConflictException('This muscle mapping already exists for this exercise');
    }

    return prisma.exerciseMuscle.create({
      data: { exerciseId, muscleId, targetType: targetType as any },
      include: { muscle: true },
    });
  }

  async removeMuscleTarget(exerciseId: string, muscleId: string) {
    const mapping = await prisma.exerciseMuscle.findUnique({
      where: { exerciseId_muscleId: { exerciseId, muscleId } },
    });
    if (!mapping) throw new NotFoundException('Muscle mapping not found');
    await prisma.exerciseMuscle.delete({
      where: { exerciseId_muscleId: { exerciseId, muscleId } },
    });
    return { message: 'Muscle target mapping removed', success: true };
  }

  async updateMuscleTargetType(
    exerciseId: string,
    muscleId: string,
    targetType: 'PRIMARY' | 'SECONDARY',
  ) {
    const mapping = await prisma.exerciseMuscle.findUnique({
      where: { exerciseId_muscleId: { exerciseId, muscleId } },
    });
    if (!mapping) throw new NotFoundException('Muscle mapping not found');
    return prisma.exerciseMuscle.update({
      where: { exerciseId_muscleId: { exerciseId, muscleId } },
      data: { targetType: targetType as any },
      include: { muscle: true },
    });
  }
}
