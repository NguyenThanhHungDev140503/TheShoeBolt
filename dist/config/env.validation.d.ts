export declare class EnvironmentVariables {
    PORT?: number;
    NODE_ENV: string;
    CORS_ORIGIN?: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    ES_NODE: string;
    MONGODB_URI: string;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
    CLERK_WEBHOOK_SECRET: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_AUTH_USER: string;
    EMAIL_AUTH_PASSWORD: string;
    EMAIL_FROM: string;
    JWT_SECRET?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    RABBITMQ_URL?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    AWS_S3_BUCKET?: string;
    THROTTLE_TTL?: number;
    THROTTLE_LIMIT?: number;
    CACHE_TTL?: number;
    LOG_LEVEL?: string;
    LOG_TO_FILE?: boolean;
    ENABLE_HELMET?: boolean;
    ENABLE_COMPRESSION?: boolean;
    HEALTH_CHECK_TIMEOUT?: number;
}
export declare function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables;
export declare const envValidationConfig: {
    validate: typeof validateEnvironment;
    validationOptions: {
        allowUnknown: boolean;
        abortEarly: boolean;
    };
};
