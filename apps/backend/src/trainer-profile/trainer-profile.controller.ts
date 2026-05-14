import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Post,
  Query,
} from '@nestjs/common';
import { TrainerProfileService } from './trainer-profile.service';

@Controller('trainer-profiles')
export class TrainerProfileController {
  constructor(private readonly service: TrainerProfileService) {}

  // Public: browse active trainer marketplace
  @Get()
  async listActiveTrainers(@Query('search') search?: string) {
    return this.service.listActiveTrainers(search);
  }

  // Trainer: view their profile
  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.service.getProfile(userId);
  }

  // Trainer: update their coaching profile (bio, certs, specialties)
  @Patch(':userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.service.updateProfile(userId, payload);
  }

  // Admin/System: submit a session rating for a trainer
  @Post(':userId/rate')
  async rateTrainer(
    @Param('userId') userId: string,
    @Body() payload: { rating: number },
  ) {
    return this.service.updateRating(userId, payload.rating);
  }
}
