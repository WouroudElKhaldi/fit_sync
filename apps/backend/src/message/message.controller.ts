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

  // User/Trainer: send a message (1-to-1 or group, with optional workout plan link)
  @Post('send/:senderId')
  async sendMessage(
    @Param('senderId') senderId: string,
    @Body() payload: { receiverId?: string; groupId?: string; content?: string; workoutPlanId?: string },
  ) {
    return this.messageService.sendMessage(senderId, payload);
  }

  // Create group chat
  @Post('groups')
  async createGroup(
    @Body() payload: { name: string; creatorId: string },
  ) {
    if (!payload.name || !payload.creatorId) {
      throw new BadRequestException('name and creatorId are required');
    }
    return this.messageService.createGroup(payload.name, payload.creatorId);
  }

  // Invite member to group chat
  @Post('groups/:groupId/invite')
  async inviteToGroup(
    @Param('groupId') groupId: string,
    @Body() payload: { inviteeId: string; inviterId: string },
  ) {
    if (!payload.inviteeId || !payload.inviterId) {
      throw new BadRequestException('inviteeId and inviterId are required');
    }
    return this.messageService.inviteToGroup(groupId, payload.inviteeId, payload.inviterId);
  }

  // Rename a group chat
  @Patch('groups/:groupId')
  async renameGroup(
    @Param('groupId') groupId: string,
    @Body() payload: { name: string; requesterId: string },
  ) {
    if (!payload.name || !payload.requesterId) {
      throw new BadRequestException('name and requesterId are required');
    }
    return this.messageService.renameGroup(groupId, payload.name, payload.requesterId);
  }

  // Delete a group chat completely
  @Delete('groups/:groupId')
  async deleteGroup(
    @Param('groupId') groupId: string,
    @Body() payload: { requesterId: string },
  ) {
    if (!payload.requesterId) {
      throw new BadRequestException('requesterId is required');
    }
    return this.messageService.deleteGroup(groupId, payload.requesterId);
  }

  // Remove a member from a group chat
  @Delete('groups/:groupId/members/:memberId')
  async removeMemberFromGroup(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Body() payload: { requesterId: string },
  ) {
    if (!payload.requesterId) {
      throw new BadRequestException('requesterId is required');
    }
    return this.messageService.removeMemberFromGroup(groupId, memberId, payload.requesterId);
  }

  // Get pending invitations for a user
  @Get('invitations/:userId')
  async getPendingInvitations(@Param('userId') userId: string) {
    return this.messageService.getPendingInvitations(userId);
  }

  // Accept or reject a group invitation
  @Patch('invitations/:membershipId/respond')
  async respondToInvitation(
    @Param('membershipId') membershipId: string,
    @Body() payload: { userId: string; status: 'ACCEPTED' | 'REJECTED' },
  ) {
    if (!payload.userId || !payload.status) {
      throw new BadRequestException('userId and status are required');
    }
    return this.messageService.respondToInvitation(membershipId, payload.userId, payload.status);
  }

  // Get chat candidates for trainer/admin
  @Get('candidates/:userId')
  async getChatCandidates(@Param('userId') userId: string) {
    return this.messageService.getChatCandidates(userId);
  }

  // Get unified list of conversations
  @Get('conversations/:userId')
  async getRecentConversations(@Param('userId') userId: string) {
    return this.messageService.getRecentConversations(userId);
  }

  // Get group conversation history
  @Get('conversation/:userId/group/:groupId')
  async getGroupConversation(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.messageService.getGroupConversation(groupId, userId);
  }

  // User: view full conversation thread with another user (private 1-to-1)
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

  // Send connection request
  @Post('connections/request')
  async sendConnectionRequest(
    @Body() payload: { requesterId: string; addresseeId: string },
  ) {
    if (!payload.requesterId || !payload.addresseeId) {
      throw new BadRequestException('requesterId and addresseeId are required');
    }
    return this.messageService.sendConnectionRequest(payload.requesterId, payload.addresseeId);
  }

  // Accept or reject connection request
  @Patch('connections/:connectionId/respond')
  async respondToConnectionRequest(
    @Param('connectionId') connectionId: string,
    @Body() payload: { userId: string; status: 'ACCEPTED' | 'REJECTED' },
  ) {
    if (!payload.userId || !payload.status) {
      throw new BadRequestException('userId and status are required');
    }
    return this.messageService.respondToConnectionRequest(connectionId, payload.userId, payload.status);
  }

  // Get pending connection requests for user
  @Get('connections/pending/:userId')
  async getPendingConnections(@Param('userId') userId: string) {
    return this.messageService.getPendingConnections(userId);
  }

  // Get accepted active connections for user
  @Get('connections/active/:userId')
  async getConnections(@Param('userId') userId: string) {
    return this.messageService.getConnections(userId);
  }

  // Get list of other trainers/admins to connect with
  @Get('connections/discovery/:userId')
  async getDiscoveryUsers(
    @Param('userId') userId: string,
    @Query('search') search?: string,
  ) {
    return this.messageService.getDiscoveryUsers(userId, search);
  }

  // Clear chat history for a specific user with a group or other user
  @Post('clear')
  async clearChat(
    @Body() payload: { userId: string; otherUserId?: string; groupId?: string },
  ) {
    if (!payload.userId || (!payload.otherUserId && !payload.groupId)) {
      throw new BadRequestException('userId and either otherUserId or groupId are required');
    }
    return this.messageService.clearChat(payload.userId, payload.otherUserId, payload.groupId);
  }

  // Block a user
  @Post('block/:userId')
  async blockUser(
    @Param('userId') blockedId: string,
    @Body() payload: { blockerId: string },
  ) {
    if (!payload.blockerId) {
      throw new BadRequestException('blockerId is required');
    }
    return this.messageService.blockUser(payload.blockerId, blockedId);
  }

  // Unblock a user
  @Delete('block/:userId')
  async unblockUser(
    @Param('userId') blockedId: string,
    @Body() payload: { blockerId: string },
  ) {
    if (!payload.blockerId) {
      throw new BadRequestException('blockerId is required');
    }
    return this.messageService.unblockUser(payload.blockerId, blockedId);
  }
}


