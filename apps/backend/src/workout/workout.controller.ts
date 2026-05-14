import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutPlanAdminService } from './workout-plan-admin.service';

@Controller('workouts/plans')
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly workoutPlanAdminService: WorkoutPlanAdminService,
  ) {}

  // ─── Plan CRUD ────────────────────────────────────────────────────────────

  @Post()
  async createPlan(
    @Query('trainerId') trainerIdQuery: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const clientId = payload?.clientId as string;
    if (!clientId) {
      throw new BadRequestException(
        'clientId parameter is required in the request body',
      );
    }
    const creatorId =
      trainerIdQuery || (payload?.trainerId as string) || clientId;
    return this.workoutService.createPlan(creatorId, payload);
  }

  @Get('client/:clientId')
  async getClientPlans(@Param('clientId') clientId: string) {
    return this.workoutService.getClientPlans(clientId);
  }

  @Get(':planId')
  async getPlanById(@Param('planId') planId: string) {
    return this.workoutService.getPlanById(planId);
  }

  @Patch(':planId')
  async updatePlan(
    @Param('planId') planId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.workoutPlanAdminService.updatePlan(planId, payload);
  }

  @Get('plans/:planId')
  async getPlan(@Param('planId') planId: string) {
    return this.workoutService.getPlanById(planId);
  }

  @Get('analytics/:clientId')
  async getVolumeAnalytics(@Param('clientId') clientId: string) {
    return this.workoutService.getVolumeAnalytics(clientId);
  }

  // ─── Plan Mutations (Admin/Trainer/Owner) ────────────────────────────────

  @Post(':planId/exercises')
  async addExerciseToPlan(
    @Param('planId') planId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.workoutPlanAdminService.addExerciseToPlan(planId, payload);
  }

  @Patch('exercises/:workoutExerciseId')
  async updateWorkoutExercise(
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Body()
    payload: { orderIndex?: number; restTimeSec?: number; notes?: string },
  ) {
    return this.workoutPlanAdminService.updateWorkoutExercise(
      workoutExerciseId,
      payload,
    );
  }

  @Delete('exercises/:workoutExerciseId')
  async removeExerciseFromPlan(
    @Param('workoutExerciseId') workoutExerciseId: string,
  ) {
    return this.workoutPlanAdminService.removeExerciseFromPlan(
      workoutExerciseId,
    );
  }

  // ─── Workout Sets (sets within a workout exercise slot) ───────────────────

  @Post('exercises/:workoutExerciseId/sets')
  async addSetToExercise(
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Body()
    payload: {
      setIndex?: number;
      expectedReps?: number;
      expectedWeight?: number;
    },
  ) {
    return this.workoutPlanAdminService.addSetToExercise(
      workoutExerciseId,
      payload,
    );
  }

  @Patch('sets/:setId')
  async updateSet(
    @Param('setId') setId: string,
    @Body()
    payload: {
      expectedReps?: number;
      expectedWeight?: number;
      setIndex?: number;
    },
  ) {
    return this.workoutPlanAdminService.updateSet(setId, payload);
  }

  @Delete('sets/:setId')
  async deleteSet(@Param('setId') setId: string) {
    return this.workoutPlanAdminService.deleteSet(setId);
  }
}

