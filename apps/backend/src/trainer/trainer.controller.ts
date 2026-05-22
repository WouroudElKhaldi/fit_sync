import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get('clients')
  async getClients(@Query('trainerId') trainerId: string) {
    if (!trainerId) {
      throw new BadRequestException('trainerId query parameter is required');
    }
    return this.trainerService.getClients(trainerId);
  }

  @Get('clients/:clientId/progress')
  async getClientProgress(
    @Query('trainerId') trainerId: string,
    @Param('clientId') clientId: string,
  ) {
    if (!trainerId) {
      throw new BadRequestException('trainerId query parameter is required');
    }
    return this.trainerService.getClientProgress(trainerId, clientId);
  }

  @Get(':trainerId/dashboard-stats')
  async getDashboardStats(@Param('trainerId') trainerId: string) {
    return this.trainerService.getDashboardStats(trainerId);
  }

  @Get(':trainerId/analytics')
  async getTrainerAnalytics(@Param('trainerId') trainerId: string) {
    return this.trainerService.getTrainerAnalytics(trainerId);
  }
}
