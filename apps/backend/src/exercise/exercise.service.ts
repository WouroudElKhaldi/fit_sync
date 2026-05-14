import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class ExerciseService {
  async findAllExercises(search?: string) {
    return prisma.exercise.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        equipment: true,
        muscles: {
          include: {
            muscle: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllMuscles() {
    return prisma.muscle.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findAllEquipment() {
    return prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findExercisesByMuscle(muscleId: string) {
    const muscle = await prisma.muscle.findUnique({
      where: { id: muscleId },
    });

    if (!muscle) {
      throw new NotFoundException('Muscle group not found');
    }

    // Query exercise associations targeting this specific muscle ID
    const mappings = await prisma.exerciseMuscle.findMany({
      where: { muscleId },
      include: {
        exercise: {
          include: {
            equipment: true,
            muscles: {
              include: { muscle: true },
            },
          },
        },
      },
    });

    return mappings.map((m) => ({
      targetType: m.targetType,
      exercise: m.exercise,
    }));
  }

  async findExerciseById(exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        equipment: true,
        muscles: {
          include: { muscle: true },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise movement not found');
    }

    return exercise;
  }
}
