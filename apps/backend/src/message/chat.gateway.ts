import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { prisma } from '@fitsync/database';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeConnections = new Map<string, Set<string>>();

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Find if this socket belongs to any user
    let userId: string | null = null;
    for (const [uid, sockets] of this.activeConnections.entries()) {
      if (sockets.has(client.id)) {
        userId = uid;
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.activeConnections.delete(uid);
        }
        break;
      }
    }

    if (userId) {
      // Check if user has any active connections left
      const remainingSockets = this.activeConnections.get(userId);
      if (!remainingSockets || remainingSockets.size === 0) {
        const lastActiveAt = new Date();
        try {
          // Update database presence status
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastActiveAt },
          });

          // Fetch connections and broadcast status change
          const connections = await this.messageService.getConnections(userId);
          connections.forEach(conn => {
            this.server.to(conn.otherUser.id).emit('user_status_change', {
              userId,
              isOnline: false,
              lastActiveAt,
            });
          });
        } catch (err) {
          console.error(`Error handling disconnect status change for user ${userId}:`, err);
        }
      }
    }
  }

  @SubscribeMessage('register_user')
  async handleRegisterUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId) return;
    
    // Join the client to their personal room
    client.join(data.userId);
    console.log(`Client ${client.id} registered user room ${data.userId}`);

    // Track active connection
    const isFirstConnection = !this.activeConnections.has(data.userId) || this.activeConnections.get(data.userId)!.size === 0;
    if (!this.activeConnections.has(data.userId)) {
      this.activeConnections.set(data.userId, new Set());
    }
    this.activeConnections.get(data.userId)!.add(client.id);

    // Update presence if this is the first connection
    if (isFirstConnection) {
      try {
        await prisma.user.update({
          where: { id: data.userId },
          data: { isOnline: true },
        });

        // Fetch connections and broadcast status change
        const connections = await this.messageService.getConnections(data.userId);
        connections.forEach(conn => {
          this.server.to(conn.otherUser.id).emit('user_status_change', {
            userId: data.userId,
            isOnline: true,
            lastActiveAt: new Date(),
          });
        });
      } catch (err) {
        console.error(`Error updating online status for user ${data.userId}:`, err);
      }
    }

    // Fetch all accepted groups for the user and join rooms
    try {
      const memberships = await prisma.chatGroupMember.findMany({
        where: { userId: data.userId, status: 'ACCEPTED' },
        select: { groupId: true },
      });
      memberships.forEach(m => {
        client.join(m.groupId);
        console.log(`Client ${client.id} joined group room ${m.groupId}`);
      });
    } catch (err) {
      console.error('Error auto-joining group rooms on websocket registration:', err);
    }
  }

  @SubscribeMessage('connection_request_sent')
  async handleConnectionRequestSent(
    @MessageBody() payload: { requesterId: string; addresseeId: string },
  ) {
    try {
      const requester = await prisma.user.findUnique({
        where: { id: payload.requesterId },
        select: { fullName: true },
      });
      
      this.server.to(payload.addresseeId).emit('new_notification', {
        type: 'CONNECTION_REQUEST',
        requesterId: payload.requesterId,
        message: `${requester?.fullName || 'A user'} wants to connect with you.`,
      });
    } catch (err) {
      console.error('Error emitting connection request notification:', err);
    }
  }

  @SubscribeMessage('group_invite_sent')
  async handleGroupInviteSent(
    @MessageBody() payload: { inviterId: string; inviteeId: string; groupId: string },
  ) {
    try {
      const [inviter, group] = await Promise.all([
        prisma.user.findUnique({
          where: { id: payload.inviterId },
          select: { fullName: true },
        }),
        prisma.chatGroup.findUnique({
          where: { id: payload.groupId },
          select: { name: true },
        }),
      ]);

      this.server.to(payload.inviteeId).emit('new_notification', {
        type: 'GROUP_INVITATION',
        groupId: payload.groupId,
        message: `${inviter?.fullName || 'A trainer'} invited you to join the group "${group?.name || 'Group Chat'}"`,
      });
    } catch (err) {
      console.error('Error emitting group invite notification:', err);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    console.log(`Client ${client.id} joined room ${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    payload: { senderId: string; receiverId?: string; groupId?: string; content: string; workoutPlanId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messageService.sendMessage(payload.senderId, {
        receiverId: payload.receiverId,
        groupId: payload.groupId,
        content: payload.content,
        workoutPlanId: payload.workoutPlanId,
      });

      if (payload.groupId) {
        // Emit to all users in the group room
        this.server.to(payload.groupId).emit('receive_message', message);
      } else if (payload.receiverId) {
        // Emit to both sender and receiver personal rooms
        this.server.to(payload.senderId).to(payload.receiverId).emit('receive_message', message);

        // Also notify the receiver specifically
        this.server.to(payload.receiverId).emit('new_notification', {
          type: 'NEW_MESSAGE',
          senderId: payload.senderId,
          message: `You have a new message from ${message.sender.fullName}`,
        });
      }
    } catch (err: any) {
      console.error('WebSocket send_message error:', err);
      client.emit('error', { message: err.message || 'Failed to process message' });
    }
  }

  @SubscribeMessage('trainer_request')
  async handleTrainerRequest(
    @MessageBody() payload: { clientId: string; trainerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(payload.trainerId).emit('new_notification', {
      type: 'TRAINER_REQUEST',
      clientId: payload.clientId,
      message: 'A user wants to hire you!',
    });

    console.log(
      `Trainer request from ${payload.clientId} to ${payload.trainerId}`,
    );
  }
}
