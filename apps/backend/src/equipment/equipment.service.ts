import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class EquipmentService {
  async findAll() {
    return prisma.equipment.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(equipmentId: string) {
    const item = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { exercises: { select: { id: true, name: true } } },
    });
    if (!item) throw new NotFoundException('Equipment not found');
    return item;
  }

  async create(name: string) {
    const existing = await prisma.equipment.findUnique({ where: { name } });
    if (existing)
      throw new ConflictException('Equipment with this name already exists');
    return prisma.equipment.create({ data: { name } });
  }

  async update(equipmentId: string, name: string) {
    const item = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!item) throw new NotFoundException('Equipment not found');
    return prisma.equipment.update({
      where: { id: equipmentId },
      data: { name },
    });
  }

  async remove(equipmentId: string) {
    const item = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!item) throw new NotFoundException('Equipment not found');
    await prisma.equipment.delete({ where: { id: equipmentId } });
    return { message: 'Equipment deleted successfully', success: true };
  }
}
