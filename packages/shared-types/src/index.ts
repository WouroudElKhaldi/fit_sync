import { z } from 'zod';

export enum Role {
  USER = 'USER',
  TRAINER = 'TRAINER',
  ADMIN = 'ADMIN',
}

export enum SetStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MODIFIED = 'MODIFIED',
  SKIPPED = 'SKIPPED',
}

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.nativeEnum(Role).default(Role.USER),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const CreateWorkoutPlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  clientId: z.string().uuid(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      orderIndex: z.number().int(),
      restTimeSec: z.number().int().optional(),
      notes: z.string().optional(),
      sets: z.array(
        z.object({
          setIndex: z.number().int(),
          expectedReps: z.number().int().positive(),
          expectedWeight: z.number().nonnegative(),
        })
      ),
    })
  ),
});

export type CreateWorkoutPlanDto = z.infer<typeof CreateWorkoutPlanSchema>;
