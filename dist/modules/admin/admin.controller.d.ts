import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    searchChatMessages(searchParams: {
        userId?: string;
        roomId?: string;
        content?: string;
        startDate?: Date;
        endDate?: Date;
        from?: number;
        size?: number;
    }): Promise<{
        hits: {
            id: string;
            score: number;
        }[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
    getChatStats(startDate?: string, endDate?: string): Promise<{
        totalMessages: number;
        totalRooms: number;
        activeRooms: number;
        messagesWithAttachments: number;
        messagesByDay: {
            date: any;
            count: any;
        }[];
    }>;
    searchUsers(query: string, from?: number, size?: number): Promise<{
        hits: {
            id: string;
            score: number;
        }[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
}
