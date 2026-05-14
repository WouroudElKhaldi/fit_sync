import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  Query,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Admin: list all users (optionally filter by role=USER|TRAINER)
  @Get()
  async listAllUsers(@Query('role') role?: string) {
    return this.userService.listAllUsers(role);
  }

  // Any user: get their own profile (or admin lookup)
  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.userService.getUserProfile(userId);
  }

  // Any user: update their own profile fields
  @Patch(':userId')
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.userService.updateUserProfile(userId, payload);
  }

  // Any user: permanently delete their own account
  @Delete(':userId')
  async deleteAccount(@Param('userId') userId: string) {
    return this.userService.deleteAccount(userId);
  }

  // User: assign themselves to a trainer
  @Post(':clientId/assign-trainer')
  async assignTrainer(
    @Param('clientId') clientId: string,
    @Body() payload: { trainerId: string },
  ) {
    return this.userService.assignTrainer(clientId, payload.trainerId);
  }

  // User: remove their trainer assignment
  @Delete(':clientId/trainer')
  async removeTrainer(@Param('clientId') clientId: string) {
    return this.userService.removeTrainer(clientId);
  }
}
