import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class WorkoutPlanAdminService {
  // ─── Plan CRUD additions ─────────────────────────────────────────────────

  async updatePlan(planId: string, payload: Record<string, unknown>) {
    const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Workout plan not found');

    return prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        title: payload.title as string | undefined,
        description: payload.description as string | undefined,
        scheduledDate: payload.scheduledDate
          ? new Date(payload.scheduledDate as string)
          : undefined,
        isRecurring: payload.isRecurring as boolean | undefined,
        recurrenceRule: payload.recurrenceRule as string | undefined,
      },
      include: { exercises: { include: { sets: true, exercise: true } } },
    });
  }

  async deletePlan(planId: string) {
    const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Workout plan not found');
    await prisma.workoutPlan.delete({ where: { id: planId } });
    return { message: 'Workout plan deleted', success: true };
  }

  // ─── WorkoutExercise (add/remove/reorder exercises within a plan) ─────────

  async addExerciseToPlan(
    planId: string,
    payload: {
      exerciseId?: string;
      orderIndex?: number;
      restTimeSec?: number;
      notes?: string;
    },
  ) {
    if (!payload.exerciseId || payload.orderIndex === undefined) {
      throw new BadRequestException('exerciseId and orderIndex are required');
    }
    const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Workout plan not found');
    const exercise = await prisma.exercise.findUnique({
      where: { id: payload.exerciseId },
    });
    if (!exercise) throw new NotFoundException('Exercise not found');

    return prisma.workoutExercise.create({
      data: {
        workoutPlanId: planId,
        exerciseId: payload.exerciseId,
        orderIndex: payload.orderIndex,
        restTimeSec: payload.restTimeSec,
        notes: payload.notes,
      },
      include: { exercise: true, sets: true },
    });
  }

  async updateWorkoutExercise(
    workoutExerciseId: string,
    payload: { orderIndex?: number; restTimeSec?: number; notes?: string },
  ) {
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (!entry) throw new NotFoundException('Workout exercise entry not found');

    return prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data: {
        orderIndex: payload.orderIndex,
        restTimeSec: payload.restTimeSec,
        notes: payload.notes,
      },
      include: { exercise: true, sets: true },
    });
  }

  async removeExerciseFromPlan(workoutExerciseId: string) {
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (!entry) throw new NotFoundException('Workout exercise entry not found');
    await prisma.workoutExercise.delete({ where: { id: workoutExerciseId } });
    return { message: 'Exercise removed from workout plan', success: true };
  }

  // ─── WorkoutSet (add/update/delete sets within a workout exercise) ────────

  async addSetToExercise(
    workoutExerciseId: string,
    payload: {
      setIndex?: number;
      expectedReps?: number;
      expectedWeight?: number;
    },
  ) {
    if (
      payload.setIndex === undefined ||
      payload.expectedReps === undefined ||
      payload.expectedWeight === undefined
    ) {
      throw new BadRequestException(
        'setIndex, expectedReps, and expectedWeight are required',
      );
    }
    const entry = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });
    if (!entry) throw new NotFoundException('Workout exercise entry not found');

    return prisma.workoutSet.create({
      data: {
        workoutExerciseId,
        setIndex: payload.setIndex,
        expectedReps: payload.expectedReps,
        expectedWeight: payload.expectedWeight,
      },
    });
  }

  async updateSet(
    setId: string,
    payload: {
      expectedReps?: number;
      expectedWeight?: number;
      setIndex?: number;
    },
  ) {
    const set = await prisma.workoutSet.findUnique({ where: { id: setId } });
    if (!set) throw new NotFoundException('Workout set not found');

    return prisma.workoutSet.update({
      where: { id: setId },
      data: {
        expectedReps: payload.expectedReps,
        expectedWeight: payload.expectedWeight,
        setIndex: payload.setIndex,
      },
    });
  }

  async deleteSet(setId: string) {
    const set = await prisma.workoutSet.findUnique({ where: { id: setId } });
    if (!set) throw new NotFoundException('Workout set not found');
    await prisma.workoutSet.delete({ where: { id: setId } });
    return { message: 'Workout set deleted', success: true };
  }
}
