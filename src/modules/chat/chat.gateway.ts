import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ClerkModuleOptions } from '../Infracstructre/clerk/clerk.module';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    @Inject('CLERK_OPTIONS') private options: ClerkModuleOptions,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from authorization header
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.error('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      // Verify token using Clerk
      try {
        const sessionToken = await clerkClient.verifyToken(token, {
          secretKey: this.options.secretKey,
          issuer: `https://clerk.${this.options.publishableKey.split('_')[1]}.lcl.dev`,
        });
        
        // Get session information
        const session = await clerkClient.sessions.getSession(sessionToken.sid);
        
        if (!session || session.status !== 'active') {
          throw new Error('Invalid or inactive session');
        }
        
        // Get user information
        const user = await clerkClient.users.getUser(session.userId);
        const userId = user.id;

        // Store the connection
        this.connectedUsers.set(userId, client.id);
        client.data.userId = userId;
        client.data.clerkUser = user;
        client.data.session = session;

        // Join rooms that the user is part of
        const rooms = await this.chatService.getRoomsByUserId(userId);
        rooms.forEach(room => {
          client.join(room.id);
        });

        this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
        
        // Emit online status to all clients
        this.server.emit('userStatus', { userId, status: 'online' });
        
        // Send the list of online users to the newly connected client
        const onlineUsers = Array.from(this.connectedUsers.keys());
        client.emit('onlineUsers', onlineUsers);
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
      
      // Emit offline status to all clients
      this.server.emit('userStatus', { userId, status: 'offline' });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): WsResponse<string> {
    client.join(roomId);
    this.logger.log(`User ${client.data.userId} joined room ${roomId}`);
    return { event: 'joinedRoom', data: roomId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): WsResponse<string> {
    client.leave(roomId);
    this.logger.log(`User ${client.data.userId} left room ${roomId}`);
    return { event: 'leftRoom', data: roomId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateChatMessageDto,
  ): Promise<WsResponse<any>> {
    try {
      // Set the userId from the authenticated connection
      createMessageDto.userId = client.data.userId;
      
      // Save the message to the database
      const savedMessage = await this.chatService.createMessage(createMessageDto);
      
      // Broadcast the message to all clients in the room
      this.server.to(createMessageDto.roomId).emit('newMessage', savedMessage);
      
      this.logger.log(`Message sent to room ${createMessageDto.roomId} by user ${client.data.userId}`);
      
      return { event: 'messageSent', data: savedMessage };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      return { event: 'messageError', data: { error: error.message } };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ): void {
    // Broadcast to everyone in the room except the sender
    client.to(data.roomId).emit('userTyping', {
      userId: client.data.userId,
      roomId: data.roomId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): Promise<void> {
    try {
      await this.chatService.markMessagesAsRead(roomId, client.data.userId);
      
      // Notify other users in the room that messages have been read
      client.to(roomId).emit('messagesRead', {
        userId: client.data.userId,
        roomId,
        timestamp: new Date(),
      });
      
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`, error.stack);
    }
  }
}