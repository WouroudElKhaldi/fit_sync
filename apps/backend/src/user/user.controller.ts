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

  // Any user: search clients/workout plans
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('callerId') callerId: string,
  ) {
    return this.userService.search(query, callerId);
  }

  // Any user: get real dynamic notifications list
  @Get(':userId/notifications')
  async getNotifications(@Param('userId') userId: string) {
    return this.userService.getNotifications(userId);
  }

  // Any user: get their own profile (or admin lookup)
  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.userService.getUserProfile(userId);
  }

  // Admin: create a new user/client
  @Post('admin-create')
  async adminCreateUser(
    @Query('adminId') adminId: string,
    @Body()
    payload: {
      email: string;
      username: string;
      fullName: string;
      role: string;
      password?: string;
    },
  ) {
    return this.userService.adminCreateUser(adminId, payload as any);
  }

  // Any user: update their own profile fields (or admin updates another user)
  @Patch(':userId')
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() payload: Record<string, unknown>,
    @Query('callerId') callerId?: string,
  ) {
    return this.userService.updateUserProfile(userId, payload, callerId);
  }

  // Any user: permanently delete their own account (or admin deletes another user)
  @Delete(':userId')
  async deleteAccount(
    @Param('userId') userId: string,
    @Query('callerId') callerId?: string,
  ) {
    return this.userService.deleteAccount(userId, callerId);
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
