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
  ForbiddenException,
  Headers,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutPlanAdminService } from './workout-plan-admin.service';
import { prisma } from '@fitsync/database';

@Controller('workouts/plans')
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly workoutPlanAdminService: WorkoutPlanAdminService,
  ) {}

  private async validateAccess(
    authHeader: string | undefined,
    planId: string,
    isWrite = false,
  ): Promise<void> {
    if (!authHeader) return;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return;
    const token = parts[1];
    if (!token.startsWith('mock-jwt-token-')) return;
    const callerId = token.replace('mock-jwt-token-', '');

    const caller = await prisma.user.findUnique({ where: { id: callerId } });
    if (!caller) return;

    if (caller.role === 'ADMIN') return;

    const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
    if (!plan) return;

    if (caller.role === 'TRAINER') {
      // Any trainer can read a plan (e.g. to view a shared workout template)
      // Only the owning trainer can write/modify it
      if (isWrite && plan.createdById !== caller.id) {
        throw new ForbiddenException(
          'You do not have permission to modify this workout plan',
        );
      }
    } else {
      if (plan.clientId !== caller.id) {
        throw new ForbiddenException(
          'You do not have permission to access this workout plan',
        );
      }
    }
  }

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
  async getPlanById(
    @Param('planId') planId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.validateAccess(authHeader, planId);
    return this.workoutService.getPlanById(planId);
  }

  @Patch(':planId')
  async updatePlan(
    @Param('planId') planId: string,
    @Body() payload: Record<string, unknown>,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.validateAccess(authHeader, planId, true);
    return this.workoutPlanAdminService.updatePlan(planId, payload);
  }

  @Get('plans/:planId')
  async getPlan(
    @Param('planId') planId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.validateAccess(authHeader, planId, false);
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
    @Headers('authorization') authHeader?: string,
  ) {
    await this.validateAccess(authHeader, planId, true);
    return this.workoutPlanAdminService.addExerciseToPlan(planId, payload);
  }

  @Patch('exercises/:workoutExerciseId')
  async updateWorkoutExercise(
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Body()
    payload: { orderIndex?: number; restTimeSec?: number; notes?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (entry) {
      await this.validateAccess(authHeader, entry.workoutPlanId, true);
    }
    return this.workoutPlanAdminService.updateWorkoutExercise(
      workoutExerciseId,
      payload,
    );
  }

  @Delete('exercises/:workoutExerciseId')
  async removeExerciseFromPlan(
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (entry) {
      await this.validateAccess(authHeader, entry.workoutPlanId, true);
    }
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
    @Headers('authorization') authHeader?: string,
  ) {
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (entry) {
      await this.validateAccess(authHeader, entry.workoutPlanId, true);
    }
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
    @Headers('authorization') authHeader?: string,
  ) {
    const set = await prisma.workoutSet.findUnique({
      where: { id: setId },
      include: { workoutExercise: true },
    });
    if (set?.workoutExercise) {
      await this.validateAccess(authHeader, set.workoutExercise.workoutPlanId, true);
    }
    return this.workoutPlanAdminService.updateSet(setId, payload);
  }

  @Delete('sets/:setId')
  async deleteSet(
    @Param('setId') setId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const set = await prisma.workoutSet.findUnique({
      where: { id: setId },
      include: { workoutExercise: true },
    });
    if (set?.workoutExercise) {
      await this.validateAccess(authHeader, set.workoutExercise.workoutPlanId, true);
    }
    return this.workoutPlanAdminService.deleteSet(setId);
  }

  @Get('trainer/:trainerId')
  async getTrainerPlans(@Param('trainerId') trainerId: string) {
    return this.workoutService.getTrainerPlans(trainerId);
  }

  @Delete(':planId')
  async deletePlan(
    @Param('planId') planId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.validateAccess(authHeader, planId, true);
    return this.workoutPlanAdminService.deletePlan(planId);
  }
}
