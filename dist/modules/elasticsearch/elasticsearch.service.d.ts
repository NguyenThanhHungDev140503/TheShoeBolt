import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ElasticsearchService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly indexPrefix;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeIndices;
    private createIndexIfNotExists;
    indexChatMessage(message: any): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    updateChatMessage(id: string, updates: any): Promise<import("@elastic/elasticsearch/lib/api/types").UpdateResponse<unknown>>;
    deleteChatMessage(id: string): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    getChatMessage(id: string): Promise<unknown>;
    bulkIndexChatMessages(messages: any[]): Promise<import("@elastic/elasticsearch/lib/api/types").BulkResponse | {
        errors: boolean;
    }>;
    searchChatMessages(query: any, options?: any): Promise<{
        hits: any[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
    searchChatHistory(params: {
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
    indexUser(user: any): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    searchUsers(query: string, options?: any): Promise<{
        hits: any[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
    checkHealth(): Promise<{
        status: import("@elastic/elasticsearch/lib/api/types").HealthStatus;
        numberOfNodes: number;
        activeShards: number;
    }>;
}
