import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { ChatService } from '../chat/chat.service';
import { Model } from 'mongoose';
import { ChatMessage } from '../chat/schemas/chat-message.schema';
import { ChatRoom } from '../chat/schemas/chat-room.schema';
export declare class AdminService {
    private readonly elasticsearchService;
    private readonly chatService;
    private chatMessageModel;
    private chatRoomModel;
    private readonly logger;
    constructor(elasticsearchService: ElasticsearchService, chatService: ChatService, chatMessageModel: Model<ChatMessage>, chatRoomModel: Model<ChatRoom>);
    searchChatMessages(params: {
        userId?: string;
        roomId?: string;
        content?: string;
        startDate?: Date;
        endDate?: Date;
        from?: number;
        size?: number;
    }): Promise<{
        hits: any[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
    searchUsers(query: string, options?: any): Promise<{
        hits: any[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
    getChatStats(startDate?: Date, endDate?: Date): Promise<{
        totalMessages: number;
        totalRooms: number;
        activeRooms: number;
        messagesWithAttachments: number;
        messagesByDay: {
            date: any;
            count: any;
        }[];
    }>;
}
