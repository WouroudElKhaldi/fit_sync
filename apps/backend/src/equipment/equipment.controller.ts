import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':equipmentId')
  async findOne(@Param('equipmentId') equipmentId: string) {
    return this.equipmentService.findOne(equipmentId);
  }

  // Admin: add new equipment to the dictionary
  @Post()
  async create(@Body() payload: { name?: string }) {
    if (!payload.name) throw new BadRequestException('name is required');
    return this.equipmentService.create(payload.name);
  }

  // Admin: rename existing equipment
  @Patch(':equipmentId')
  async update(
    @Param('equipmentId') equipmentId: string,
    @Body() payload: { name?: string },
  ) {
    if (!payload.name) throw new BadRequestException('name is required');
    return this.equipmentService.update(equipmentId, payload.name);
  }

  // Admin: remove equipment from dictionary
  @Delete(':equipmentId')
  async remove(@Param('equipmentId') equipmentId: string) {
    return this.equipmentService.remove(equipmentId);
  }
}
