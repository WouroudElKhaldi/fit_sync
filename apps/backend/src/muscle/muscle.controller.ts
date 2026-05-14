import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MuscleService } from './muscle.service';

@Controller('muscles')
export class MuscleController {
  constructor(private readonly muscleService: MuscleService) {}

  // List all muscles, optionally filtered by ?category=Chest
  @Get()
  async findAll(@Query('category') category?: string) {
    return this.muscleService.findAll(category);
  }

  @Get(':muscleId')
  async findOne(@Param('muscleId') muscleId: string) {
    return this.muscleService.findOne(muscleId);
  }

  // Admin: create a new muscle entry
  @Post()
  async create(@Body() payload: { name?: string; category?: string }) {
    if (!payload.name || !payload.category) {
      throw new BadRequestException('name and category are required');
    }
    return this.muscleService.create(payload.name, payload.category);
  }

  // Admin: update muscle name or category
  @Patch(':muscleId')
  async update(
    @Param('muscleId') muscleId: string,
    @Body() payload: { name?: string; category?: string },
  ) {
    return this.muscleService.update(muscleId, payload);
  }

  // Admin: remove muscle from dictionary
  @Delete(':muscleId')
  async remove(@Param('muscleId') muscleId: string) {
    return this.muscleService.remove(muscleId);
  }
}
