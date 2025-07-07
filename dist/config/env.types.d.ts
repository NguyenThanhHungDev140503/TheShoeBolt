export type NodeEnvironment = 'development' | 'production' | 'test' | 'staging';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
export interface DatabaseConfig {
    type: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    entities: string[];
    migrations: string[];
    cli: {
        migrationsDir: string;
    };
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    ttl: number;
}
export interface ElasticsearchConfig {
    node: string;
    maxRetries: number;
    requestTimeout: number;
    pingTimeout: number;
}
export interface MongodbConfig {
    uri: string;
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
}
export interface ClerkConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
}
export interface EmailConfig {
    host: string;
    port: number;
    auth: {
        user: string;
        password: string;
    };
    from: string;
    secure: boolean;
}
export interface StripeConfig {
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
}
export interface AwsConfig {
    accessKeyId?: string;
    secretAccessKey?: string;
    region: string;
    s3Bucket?: string;
}
export interface ThrottleConfig {
    ttl: number;
    limit: number;
}
export interface CacheConfig {
    ttl: number;
    store: string;
    host: string;
    port: number;
    password?: string;
}
export interface LoggingConfig {
    level: LogLevel;
    toFile: boolean;
    errorLogPath: string;
    combinedLogPath: string;
}
export interface SecurityConfig {
    enableHelmet: boolean;
    enableCompression: boolean;
    corsOrigin: string;
}
export interface HealthCheckConfig {
    timeout: number;
}
export interface AppConfig {
    port: number;
    nodeEnv: NodeEnvironment;
    database: DatabaseConfig;
    redis: RedisConfig;
    elasticsearch: ElasticsearchConfig;
    mongodb: MongodbConfig;
    clerk: ClerkConfig;
    email: EmailConfig;
    stripe: StripeConfig;
    aws: AwsConfig;
    throttle: ThrottleConfig;
    cache: CacheConfig;
    logging: LoggingConfig;
    security: SecurityConfig;
    healthCheck: HealthCheckConfig;
    rabbitmq?: {
        url: string;
    };
    jwt?: {
        secret: string;
    };
}
export declare const ENV_KEYS: {
    readonly PORT: "PORT";
    readonly NODE_ENV: "NODE_ENV";
    readonly CORS_ORIGIN: "CORS_ORIGIN";
    readonly DB_HOST: "DB_HOST";
    readonly DB_PORT: "DB_PORT";
    readonly DB_USERNAME: "DB_USERNAME";
    readonly DB_PASSWORD: "DB_PASSWORD";
    readonly DB_NAME: "DB_NAME";
    readonly REDIS_HOST: "REDIS_HOST";
    readonly REDIS_PORT: "REDIS_PORT";
    readonly REDIS_PASSWORD: "REDIS_PASSWORD";
    readonly ES_NODE: "ES_NODE";
    readonly MONGODB_URI: "MONGODB_URI";
    readonly CLERK_SECRET_KEY: "CLERK_SECRET_KEY";
    readonly CLERK_PUBLISHABLE_KEY: "CLERK_PUBLISHABLE_KEY";
    readonly CLERK_WEBHOOK_SECRET: "CLERK_WEBHOOK_SECRET";
    readonly EMAIL_HOST: "EMAIL_HOST";
    readonly EMAIL_PORT: "EMAIL_PORT";
    readonly EMAIL_AUTH_USER: "EMAIL_AUTH_USER";
    readonly EMAIL_AUTH_PASSWORD: "EMAIL_AUTH_PASSWORD";
    readonly EMAIL_FROM: "EMAIL_FROM";
    readonly STRIPE_SECRET_KEY: "STRIPE_SECRET_KEY";
    readonly STRIPE_PUBLISHABLE_KEY: "STRIPE_PUBLISHABLE_KEY";
    readonly STRIPE_WEBHOOK_SECRET: "STRIPE_WEBHOOK_SECRET";
    readonly AWS_ACCESS_KEY_ID: "AWS_ACCESS_KEY_ID";
    readonly AWS_SECRET_ACCESS_KEY: "AWS_SECRET_ACCESS_KEY";
    readonly AWS_REGION: "AWS_REGION";
    readonly AWS_S3_BUCKET: "AWS_S3_BUCKET";
    readonly THROTTLE_TTL: "THROTTLE_TTL";
    readonly THROTTLE_LIMIT: "THROTTLE_LIMIT";
    readonly CACHE_TTL: "CACHE_TTL";
    readonly LOG_LEVEL: "LOG_LEVEL";
    readonly LOG_TO_FILE: "LOG_TO_FILE";
    readonly ENABLE_HELMET: "ENABLE_HELMET";
    readonly ENABLE_COMPRESSION: "ENABLE_COMPRESSION";
    readonly HEALTH_CHECK_TIMEOUT: "HEALTH_CHECK_TIMEOUT";
    readonly RABBITMQ_URL: "RABBITMQ_URL";
    readonly JWT_SECRET: "JWT_SECRET";
};
export type EnvKey = keyof typeof ENV_KEYS;
export declare function isValidEnvKey(key: string): key is EnvKey;
export declare const ENV_DEFAULTS: {
    readonly PORT: 3000;
    readonly NODE_ENV: NodeEnvironment;
    readonly CORS_ORIGIN: "http://localhost:3000";
    readonly REDIS_PASSWORD: "";
    readonly AWS_REGION: "us-east-1";
    readonly THROTTLE_TTL: 60000;
    readonly THROTTLE_LIMIT: 100;
    readonly CACHE_TTL: 300;
    readonly LOG_LEVEL: LogLevel;
    readonly LOG_TO_FILE: true;
    readonly ENABLE_HELMET: true;
    readonly ENABLE_COMPRESSION: true;
    readonly HEALTH_CHECK_TIMEOUT: 5000;
    readonly RABBITMQ_URL: "amqp://localhost:5672";
};
