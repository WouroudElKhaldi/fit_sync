import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // User/Trainer: send a message
  @Post('send/:senderId')
  async sendMessage(
    @Param('senderId') senderId: string,
    @Body() payload: { receiverId?: string; content?: string },
  ) {
    return this.messageService.sendMessage(senderId, payload);
  }

  // User: view inbox (received messages)
  @Get('inbox/:userId')
  async getInbox(@Param('userId') userId: string) {
    return this.messageService.getInbox(userId);
  }

  // User: view sent message history
  @Get('sent/:userId')
  async getSentMessages(@Param('userId') userId: string) {
    return this.messageService.getSentMessages(userId);
  }

  // User: view full conversation thread with another user
  @Get('conversation/:userId')
  async getConversation(
    @Param('userId') userId: string,
    @Query('with') otherUserId: string,
  ) {
    if (!otherUserId) {
      throw new BadRequestException(
        'Query parameter ?with=<userId> is required',
      );
    }
    return this.messageService.getConversation(userId, otherUserId);
  }

  // User: count their unread inbox messages
  @Get('unread/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.messageService.getUnreadCount(userId);
  }

  // User: mark a specific message as read
  @Patch(':messageId/read')
  async markAsRead(
    @Param('messageId') messageId: string,
    @Body() payload: { userId?: string },
  ) {
    if (!payload.userId) {
      throw new BadRequestException('userId is required in the request body');
    }
    return this.messageService.markAsRead(messageId, payload.userId);
  }

  // User: mark all messages from a sender as read in bulk
  @Patch('read-all/:receiverId')
  async markAllAsRead(
    @Param('receiverId') receiverId: string,
    @Body() payload: { senderId?: string },
  ) {
    if (!payload.senderId) {
      throw new BadRequestException('senderId is required in the request body');
    }
    return this.messageService.markAllAsRead(receiverId, payload.senderId);
  }

  // User/Admin: delete a message
  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.messageService.deleteMessage(messageId);
  }
}
