import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class MuscleService {
  async findAll(category?: string) {
    return prisma.muscle.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(muscleId: string) {
    const muscle = await prisma.muscle.findUnique({
      where: { id: muscleId },
      include: {
        exercises: {
          include: {
            exercise: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!muscle) throw new NotFoundException('Muscle group not found');
    return muscle;
  }

  async create(name: string, category: string) {
    const existing = await prisma.muscle.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Muscle with this name already exists');
    return prisma.muscle.create({ data: { name, category } });
  }

  async update(muscleId: string, payload: { name?: string; category?: string }) {
    const muscle = await prisma.muscle.findUnique({ where: { id: muscleId } });
    if (!muscle) throw new NotFoundException('Muscle group not found');
    return prisma.muscle.update({
      where: { id: muscleId },
      data: { name: payload.name, category: payload.category },
    });
  }

  async remove(muscleId: string) {
    const muscle = await prisma.muscle.findUnique({ where: { id: muscleId } });
    if (!muscle) throw new NotFoundException('Muscle group not found');
    await prisma.muscle.delete({ where: { id: muscleId } });
    return { message: 'Muscle group deleted successfully', success: true };
  }
}
