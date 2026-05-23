import { Injectable } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    console.log(`[Notification] To: ${userId} | ${title}: ${body}`, data);
    return { success: true, timestamp: new Date() };
  }

  async scheduleWorkoutReminder(userId: string, workoutTime: Date) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const leadTime = user.notificationLeadMinutes || 60;
    const reminderTime = new Date(workoutTime.getTime() - leadTime * 60000);

    console.log(
      `[Scheduler] Reminder for user ${userId} scheduled at ${reminderTime}`,
    );
  }
}
