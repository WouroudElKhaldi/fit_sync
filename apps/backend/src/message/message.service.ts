import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class MessageService {
  // User/Trainer: send a message to another user
  async sendMessage(
    senderId: string,
    payload: { receiverId?: string; content?: string },
  ) {
    if (!payload.receiverId || !payload.content) {
      throw new BadRequestException('receiverId and content are required');
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: payload.receiverId } }),
    ]);
    if (!sender) throw new NotFoundException('Sender not found');
    if (!receiver) throw new NotFoundException('Receiver not found');
    if (senderId === payload.receiverId) {
      throw new BadRequestException('Cannot send a message to yourself');
    }

    return prisma.message.create({
      data: {
        senderId,
        receiverId: payload.receiverId,
        content: payload.content,
      },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });
  }

  // User: get their inbox (all received messages)
  async getInbox(userId: string) {
    return prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // User: get their sent message history
  async getSentMessages(userId: string) {
    return prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // User: get full conversation thread with another specific user
  async getConversation(userId: string, otherUserId: string) {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // User: mark a received message as read
  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.receiverId !== userId) {
      throw new BadRequestException(
        'You can only mark your own received messages as read',
      );
    }
    return prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  // User: mark all inbox messages from a sender as read
  async markAllAsRead(receiverId: string, senderId: string) {
    await prisma.message.updateMany({
      where: { receiverId, senderId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All messages marked as read', success: true };
  }

  // User: count unread messages
  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    return { unreadCount: count };
  }

  // User/Admin: delete a specific message
  async deleteMessage(messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    await prisma.message.delete({ where: { id: messageId } });
    return { message: 'Message deleted', success: true };
  }
}
