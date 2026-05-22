import { Controller, Post, Get, Patch, Body, Param, Headers } from '@nestjs/common';
import { SessionService } from './session.service';
import { SetStatus } from '@fitsync/shared-types';
import { prisma } from '@fitsync/database';

@Controller('workouts/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // User: start a live execution session from a plan
  @Post('start')
  async startSession(@Body() payload: { workoutPlanId: string }) {
    return this.sessionService.startSession(payload.workoutPlanId);
  }

  // User: get a session by its ID
  @Get(':sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.sessionService.getSession(sessionId);
  }

  // User: get a session linked to a specific plan
  @Get('by-plan/:planId')
  getSessionByPlan(@Param('planId') planId: string) {
    return this.sessionService.getSessionByPlan(planId);
  }

  // User: get their full session history
  @Get('history/:clientId')
  getSessionHistory(@Param('clientId') clientId: string) {
    return this.sessionService.getSessionHistory(clientId);
  }

  // User: log actual reps/weight for a set during execution
  @Patch('set/:setId')
  async updateSetExecution(
    @Param('setId') setId: string,
    @Body()
    payload: {
      actualReps?: number;
      actualWeight?: number;
      status?: SetStatus;
    },
  ) {
    return this.sessionService.updateSetExecution(setId, payload);
  }

  // User: mark the session as completed and compute total volume
  @Post(':sessionId/complete')
  async completeSession(
    @Param('sessionId') sessionId: string,
    @Body() payload: { clientNotes?: string },
  ) {
    return this.sessionService.completeSession(sessionId, payload);
  }

  // Trainer: submit feedback and rating for a client session
  @Patch(':sessionId/feedback')
  submitTrainerFeedback(
    @Param('sessionId') sessionId: string,
    @Body() payload: { trainerFeedback?: string; trainerRating?: number },
  ) {
    return this.sessionService.submitTrainerFeedback(sessionId, payload);
  }

  @Get('trainer/:trainerId')
  async getTrainerClientsSessions(
    @Param('trainerId') trainerId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let isAdmin = false;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        const token = parts[1];
        if (token.startsWith('mock-jwt-token-')) {
          const callerId = token.replace('mock-jwt-token-', '');
          const caller = await prisma.user.findUnique({ where: { id: callerId } });
          if (caller?.role === 'ADMIN') {
            isAdmin = true;
          }
        }
      }
    }
    return this.sessionService.getTrainerClientsSessions(trainerId, isAdmin);
  }
}
