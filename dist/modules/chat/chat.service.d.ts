import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { ChatRoom, ChatRoomDocument } from './schemas/chat-room.schema';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
export declare class ChatService {
    private chatMessageModel;
    private chatRoomModel;
    private readonly elasticsearchService;
    private readonly logger;
    constructor(chatMessageModel: Model<ChatMessageDocument>, chatRoomModel: Model<ChatRoomDocument>, elasticsearchService: ElasticsearchService);
    createRoom(createChatRoomDto: CreateChatRoomDto): Promise<ChatRoom>;
    getRoomById(id: string): Promise<ChatRoom>;
    getRoomsByUserId(userId: string): Promise<ChatRoom[]>;
    createMessage(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage>;
    getMessagesByRoomId(roomId: string, limit?: number, before?: Date): Promise<ChatMessage[]>;
    markMessagesAsRead(roomId: string, userId: string): Promise<void>;
    searchMessages(params: {
        userId?: string;
        roomId?: string;
        content?: string;
        startDate?: Date;
        endDate?: Date;
        from?: number;
        size?: number;
    }): Promise<any>;
}
