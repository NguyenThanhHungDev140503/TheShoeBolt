import { ConfigService } from '@nestjs/config';
import { AppConfig, DatabaseConfig, RedisConfig, ElasticsearchConfig, MongodbConfig, ClerkConfig, EmailConfig, StripeConfig, AwsConfig, ThrottleConfig, CacheConfig, LoggingConfig, SecurityConfig, HealthCheckConfig, NodeEnvironment } from './env.types';
export declare class EnvConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    get port(): number;
    get nodeEnv(): NodeEnvironment;
    get isDevelopment(): boolean;
    get isProduction(): boolean;
    get isTest(): boolean;
    get database(): DatabaseConfig;
    get redis(): RedisConfig;
    get elasticsearch(): ElasticsearchConfig;
    get mongodb(): MongodbConfig;
    get clerk(): ClerkConfig;
    get email(): EmailConfig;
    get stripe(): StripeConfig;
    get aws(): AwsConfig;
    get throttle(): ThrottleConfig;
    get cache(): CacheConfig;
    get logging(): LoggingConfig;
    get security(): SecurityConfig;
    get healthCheck(): HealthCheckConfig;
    get rabbitmqUrl(): string | undefined;
    get jwtSecret(): string | undefined;
    get appConfig(): AppConfig;
    validateRequiredEnvVars(): void;
}
