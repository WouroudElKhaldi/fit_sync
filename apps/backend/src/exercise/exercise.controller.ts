import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseAdminService } from './exercise-admin.service';

@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseAdminService: ExerciseAdminService,
  ) {}

  // ─── Public Read ──────────────────────────────────────────────────────────

  @Get()
  async findAllExercises(@Query('search') search?: string) {
    return this.exerciseService.findAllExercises(search);
  }

  @Get('muscles')
  async findAllMuscles() {
    return this.exerciseService.findAllMuscles();
  }

  @Get('equipment')
  async findAllEquipment() {
    return this.exerciseService.findAllEquipment();
  }

  @Get('muscle/:muscleId')
  async findExercisesByMuscle(@Param('muscleId') muscleId: string) {
    return this.exerciseService.findExercisesByMuscle(muscleId);
  }

  @Get(':exerciseId')
  async findExerciseById(@Param('exerciseId') exerciseId: string) {
    return this.exerciseService.findExerciseById(exerciseId);
  }

  // ─── Admin: Exercise CRUD ─────────────────────────────────────────────────

  @Post()
  async createExercise(@Body() payload: Record<string, unknown>) {
    return this.exerciseAdminService.createExercise(payload);
  }

  @Patch(':exerciseId')
  async updateExercise(
    @Param('exerciseId') exerciseId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.exerciseAdminService.updateExercise(exerciseId, payload);
  }

  @Delete(':exerciseId')
  async deleteExercise(@Param('exerciseId') exerciseId: string) {
    return this.exerciseAdminService.deleteExercise(exerciseId);
  }

  // ─── Admin: Muscle Target Mappings ────────────────────────────────────────

  @Post(':exerciseId/muscles')
  async addMuscleTarget(
    @Param('exerciseId') exerciseId: string,
    @Body()
    payload: { muscleId?: string; targetType?: 'PRIMARY' | 'SECONDARY' },
  ) {
    if (!payload.muscleId || !payload.targetType) {
      throw new BadRequestException('muscleId and targetType are required');
    }
    return this.exerciseAdminService.addMuscleTarget(
      exerciseId,
      payload.muscleId,
      payload.targetType,
    );
  }

  @Patch(':exerciseId/muscles/:muscleId')
  async updateMuscleTargetType(
    @Param('exerciseId') exerciseId: string,
    @Param('muscleId') muscleId: string,
    @Body() payload: { targetType?: 'PRIMARY' | 'SECONDARY' },
  ) {
    if (!payload.targetType) {
      throw new BadRequestException('targetType is required');
    }
    return this.exerciseAdminService.updateMuscleTargetType(
      exerciseId,
      muscleId,
      payload.targetType,
    );
  }

  @Delete(':exerciseId/muscles/:muscleId')
  async removeMuscleTarget(
    @Param('exerciseId') exerciseId: string,
    @Param('muscleId') muscleId: string,
  ) {
    return this.exerciseAdminService.removeMuscleTarget(exerciseId, muscleId);
  }
}
