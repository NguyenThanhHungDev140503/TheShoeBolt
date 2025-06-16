import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
export declare class ChatController {
    private readonly chatService;
    private readonly logger;
    constructor(chatService: ChatService);
    createRoom(createChatRoomDto: CreateChatRoomDto, req: any): Promise<import("./schemas/chat-room.schema").ChatRoom>;
    getUserRooms(req: any): Promise<import("./schemas/chat-room.schema").ChatRoom[]>;
    getRoomById(id: string): Promise<import("./schemas/chat-room.schema").ChatRoom>;
    createMessage(createChatMessageDto: CreateChatMessageDto, req: any): Promise<import("./schemas/chat-message.schema").ChatMessage>;
    getRoomMessages(roomId: string, limit?: number, before?: string): Promise<import("./schemas/chat-message.schema").ChatMessage[]>;
    markMessagesAsRead(roomId: string, req: any): Promise<{
        success: boolean;
    }>;
    searchMessages(searchParams: {
        roomId?: string;
        content?: string;
        startDate?: Date;
        endDate?: Date;
        from?: number;
        size?: number;
    }, req: any): Promise<any>;
}
