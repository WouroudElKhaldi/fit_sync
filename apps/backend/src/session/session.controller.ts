import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { SetStatus } from '@fitsync/shared-types';

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
}
