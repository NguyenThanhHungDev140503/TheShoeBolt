import { ElasticsearchService } from './elasticsearch.service';
export declare class ElasticsearchController {
    private readonly elasticsearchService;
    private readonly logger;
    constructor(elasticsearchService: ElasticsearchService);
    checkHealth(): Promise<{
        status: import("@elastic/elasticsearch/lib/api/types").HealthStatus;
        numberOfNodes: number;
        activeShards: number;
    }>;
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
    searchUsers(query: string, from?: number, size?: number): Promise<{
        hits: {
            id: string;
            score: number;
        }[];
        total: number | import("@elastic/elasticsearch/lib/api/types").SearchTotalHits;
    }>;
}
