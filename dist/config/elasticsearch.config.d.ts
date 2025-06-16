export declare const elasticsearchConfig: (() => {
    node: string;
    username: string;
    password: string;
    indexPrefix: string;
    defaultSettings: {
        number_of_shards: number;
        number_of_replicas: number;
        refresh_interval: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    node: string;
    username: string;
    password: string;
    indexPrefix: string;
    defaultSettings: {
        number_of_shards: number;
        number_of_replicas: number;
        refresh_interval: string;
    };
}>;
