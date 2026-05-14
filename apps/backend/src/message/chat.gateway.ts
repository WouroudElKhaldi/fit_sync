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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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
    @MessageBody() payload: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.sendMessage(payload.senderId, {
      receiverId: payload.receiverId,
      content: payload.content,
    });

    // Room ID can be a sorted combination of user IDs for private chat
    const conversationId = [payload.senderId, payload.receiverId].sort().join('-');
    
    this.server.to(conversationId).emit('receive_message', message);
    
    // Also notify the receiver specifically if they are not in the room
    this.server.to(payload.receiverId).emit('new_notification', {
      type: 'NEW_MESSAGE',
      senderId: payload.senderId,
      message: 'You have a new message',
    });
  }

  @SubscribeMessage('trainer_request')
  async handleTrainerRequest(
    @MessageBody() payload: { clientId: string; trainerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Notify trainer of the request
    this.server.to(payload.trainerId).emit('new_notification', {
      type: 'TRAINER_REQUEST',
      clientId: payload.clientId,
      message: 'A user wants to hire you!',
    });
    
    console.log(`Trainer request from ${payload.clientId} to ${payload.trainerId}`);
  }
}
