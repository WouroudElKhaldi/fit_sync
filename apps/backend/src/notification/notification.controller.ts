import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Post(':userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Post(':userId/read/:notificationId')
  async markAsRead(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }
}
