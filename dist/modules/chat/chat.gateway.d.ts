import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ClerkModuleOptions } from '../Infracstructre/clerk/clerk.module';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private options;
    server: Server;
    private readonly logger;
    private readonly connectedUsers;
    constructor(chatService: ChatService, options: ClerkModuleOptions);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, roomId: string): WsResponse<string>;
    handleLeaveRoom(client: Socket, roomId: string): WsResponse<string>;
    handleSendMessage(client: Socket, createMessageDto: CreateChatMessageDto): Promise<WsResponse<any>>;
    handleTyping(client: Socket, data: {
        roomId: string;
        isTyping: boolean;
    }): void;
    handleMarkAsRead(client: Socket, roomId: string): Promise<void>;
}
