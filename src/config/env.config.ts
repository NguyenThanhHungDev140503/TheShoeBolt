import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  RedisConfig,
  ElasticsearchConfig,
  MongodbConfig,
  ClerkConfig,
  EmailConfig,
  StripeConfig,
  AwsConfig,
  ThrottleConfig,
  CacheConfig,
  LoggingConfig,
  SecurityConfig,
  HealthCheckConfig,
  NodeEnvironment,
  LogLevel,
  ENV_KEYS,
  ENV_DEFAULTS,
} from './env.types';

/**
 * Environment Configuration Service
 * Provides type-safe access to validated environment variables
 */
@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get application port
   */
  get port(): number {
    return this.configService.get<number>(ENV_KEYS.PORT) ?? ENV_DEFAULTS.PORT;
  }

  /**
   * Get node environment
   */
  get nodeEnv(): NodeEnvironment {
    return (this.configService.get<NodeEnvironment>(ENV_KEYS.NODE_ENV) ?? ENV_DEFAULTS.NODE_ENV) as NodeEnvironment;
  }

  /**
   * Check if running in development mode
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Check if running in production mode
   */
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Check if running in test mode
   */
  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  /**
   * Get database configuration
   */
  get database(): DatabaseConfig {
    return {
      type: 'postgres',
      host: this.configService.get<string>(ENV_KEYS.DB_HOST)!,
      port: this.configService.get<number>(ENV_KEYS.DB_PORT)!,
      username: this.configService.get<string>(ENV_KEYS.DB_USERNAME)!,
      password: this.configService.get<string>(ENV_KEYS.DB_PASSWORD)!,
      database: this.configService.get<string>(ENV_KEYS.DB_NAME)!,
      synchronize: this.isDevelopment,
      logging: this.isDevelopment,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      cli: {
        migrationsDir: 'src/database/migrations',
      },
    };
  }

  /**
   * Get Redis configuration
   */
  get redis(): RedisConfig {
    return {
      host: this.configService.get<string>(ENV_KEYS.REDIS_HOST)!,
      port: this.configService.get<number>(ENV_KEYS.REDIS_PORT)!,
      password: this.configService.get<string>(ENV_KEYS.REDIS_PASSWORD) || undefined,
      ttl: this.configService.get<number>(ENV_KEYS.CACHE_TTL) ?? ENV_DEFAULTS.CACHE_TTL,
    };
  }

  /**
   * Get Elasticsearch configuration
   */
  get elasticsearch(): ElasticsearchConfig {
    return {
      node: this.configService.get<string>(ENV_KEYS.ES_NODE)!,
      maxRetries: 3,
      requestTimeout: 60000,
      pingTimeout: 3000,
    };
  }

  /**
   * Get MongoDB configuration
   */
  get mongodb(): MongodbConfig {
    return {
      uri: this.configService.get<string>(ENV_KEYS.MONGODB_URI)!,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  /**
   * Get Clerk authentication configuration
   */
  get clerk(): ClerkConfig {
    return {
      secretKey: this.configService.get<string>(ENV_KEYS.CLERK_SECRET_KEY)!,
      publishableKey: this.configService.get<string>(ENV_KEYS.CLERK_PUBLISHABLE_KEY)!,
      webhookSecret: this.configService.get<string>(ENV_KEYS.CLERK_WEBHOOK_SECRET)!,
    };
  }

  /**
   * Get email service configuration
   */
  get email(): EmailConfig {
    const port = this.configService.get<number>(ENV_KEYS.EMAIL_PORT)!;
    return {
      host: this.configService.get<string>(ENV_KEYS.EMAIL_HOST)!,
      port,
      auth: {
        user: this.configService.get<string>(ENV_KEYS.EMAIL_AUTH_USER)!,
        password: this.configService.get<string>(ENV_KEYS.EMAIL_AUTH_PASSWORD)!,
      },
      from: this.configService.get<string>(ENV_KEYS.EMAIL_FROM)!,
      secure: port === 465, // Use secure connection for port 465
    };
  }

  /**
   * Get Stripe configuration (optional)
   */
  get stripe(): StripeConfig {
    return {
      secretKey: this.configService.get<string>(ENV_KEYS.STRIPE_SECRET_KEY),
      publishableKey: this.configService.get<string>(ENV_KEYS.STRIPE_PUBLISHABLE_KEY),
      webhookSecret: this.configService.get<string>(ENV_KEYS.STRIPE_WEBHOOK_SECRET),
    };
  }

  /**
   * Get AWS configuration (optional)
   */
  get aws(): AwsConfig {
    return {
      accessKeyId: this.configService.get<string>(ENV_KEYS.AWS_ACCESS_KEY_ID),
      secretAccessKey: this.configService.get<string>(ENV_KEYS.AWS_SECRET_ACCESS_KEY),
      region: this.configService.get<string>(ENV_KEYS.AWS_REGION) ?? ENV_DEFAULTS.AWS_REGION,
      s3Bucket: this.configService.get<string>(ENV_KEYS.AWS_S3_BUCKET),
    };
  }

  /**
   * Get throttle/rate limiting configuration
   */
  get throttle(): ThrottleConfig {
    return {
      ttl: this.configService.get<number>(ENV_KEYS.THROTTLE_TTL) ?? ENV_DEFAULTS.THROTTLE_TTL,
      limit: this.configService.get<number>(ENV_KEYS.THROTTLE_LIMIT) ?? ENV_DEFAULTS.THROTTLE_LIMIT,
    };
  }

  /**
   * Get cache configuration
   */
  get cache(): CacheConfig {
    return {
      ttl: this.configService.get<number>(ENV_KEYS.CACHE_TTL) ?? ENV_DEFAULTS.CACHE_TTL,
      store: 'redis',
      host: this.redis.host,
      port: this.redis.port,
      password: this.redis.password,
    };
  }

  /**
   * Get logging configuration
   */
  get logging(): LoggingConfig {
    return {
      level: (this.configService.get<LogLevel>(ENV_KEYS.LOG_LEVEL) ?? ENV_DEFAULTS.LOG_LEVEL) as LogLevel,
      toFile: this.configService.get<boolean>(ENV_KEYS.LOG_TO_FILE) ?? ENV_DEFAULTS.LOG_TO_FILE,
      errorLogPath: 'logs/error.log',
      combinedLogPath: 'logs/combined.log',
    };
  }

  /**
   * Get security configuration
   */
  get security(): SecurityConfig {
    return {
      enableHelmet: this.configService.get<boolean>(ENV_KEYS.ENABLE_HELMET) ?? ENV_DEFAULTS.ENABLE_HELMET,
      enableCompression: this.configService.get<boolean>(ENV_KEYS.ENABLE_COMPRESSION) ?? ENV_DEFAULTS.ENABLE_COMPRESSION,
      corsOrigin: this.configService.get<string>(ENV_KEYS.CORS_ORIGIN) ?? ENV_DEFAULTS.CORS_ORIGIN,
    };
  }

  /**
   * Get health check configuration
   */
  get healthCheck(): HealthCheckConfig {
    return {
      timeout: this.configService.get<number>(ENV_KEYS.HEALTH_CHECK_TIMEOUT) ?? ENV_DEFAULTS.HEALTH_CHECK_TIMEOUT,
    };
  }

  /**
   * Get RabbitMQ URL (optional)
   */
  get rabbitmqUrl(): string | undefined {
    return this.configService.get<string>(ENV_KEYS.RABBITMQ_URL) ?? ENV_DEFAULTS.RABBITMQ_URL;
  }

  /**
   * Get JWT secret (legacy, optional)
   */
  get jwtSecret(): string | undefined {
    return this.configService.get<string>(ENV_KEYS.JWT_SECRET);
  }

  /**
   * Get complete application configuration
   */
  get appConfig(): AppConfig {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      database: this.database,
      redis: this.redis,
      elasticsearch: this.elasticsearch,
      mongodb: this.mongodb,
      clerk: this.clerk,
      email: this.email,
      stripe: this.stripe,
      aws: this.aws,
      throttle: this.throttle,
      cache: this.cache,
      logging: this.logging,
      security: this.security,
      healthCheck: this.healthCheck,
      ...(this.rabbitmqUrl && { rabbitmq: { url: this.rabbitmqUrl } }),
      ...(this.jwtSecret && { jwt: { secret: this.jwtSecret } }),
    };
  }

  /**
   * Validate that all required environment variables are present
   */
  validateRequiredEnvVars(): void {
    const requiredVars = [
      ENV_KEYS.DB_HOST,
      ENV_KEYS.DB_PORT,
      ENV_KEYS.DB_USERNAME,
      ENV_KEYS.DB_PASSWORD,
      ENV_KEYS.DB_NAME,
      ENV_KEYS.REDIS_HOST,
      ENV_KEYS.REDIS_PORT,
      ENV_KEYS.ES_NODE,
      ENV_KEYS.MONGODB_URI,
      ENV_KEYS.CLERK_SECRET_KEY,
      ENV_KEYS.CLERK_PUBLISHABLE_KEY,
      ENV_KEYS.CLERK_WEBHOOK_SECRET,
      ENV_KEYS.EMAIL_HOST,
      ENV_KEYS.EMAIL_PORT,
      ENV_KEYS.EMAIL_AUTH_USER,
      ENV_KEYS.EMAIL_AUTH_PASSWORD,
      ENV_KEYS.EMAIL_FROM,
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName)
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
}
