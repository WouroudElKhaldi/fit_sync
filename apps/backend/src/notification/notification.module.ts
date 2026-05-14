import { Injectable, Module } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class NotificationService {
  async sendNotification(userId: string, title: string, body: string, data?: any) {
    console.log(`[Notification] To: ${userId} | ${title}: ${body}`, data);
    // In a real app, this would integrate with FCM or OneSignal
    return { success: true, timestamp: new Date() };
  }

  async scheduleWorkoutReminder(userId: string, workoutTime: Date) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const leadTime = user.notificationLeadMinutes || 60;
    const reminderTime = new Date(workoutTime.getTime() - leadTime * 60000);

    console.log(`[Scheduler] Reminder for user ${userId} scheduled at ${reminderTime}`);
    // Real implementation would use NestJS @nestjs/schedule
  }
}

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
