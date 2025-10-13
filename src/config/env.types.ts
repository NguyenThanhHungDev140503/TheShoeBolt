/**
 * Environment Configuration Types
 * Provides type-safe access to environment variables throughout the application
 */
import { databaseConfig } from "@/config/database.config";
import { ENV_KEYS } from './env.constants';


export type NodeEnvironment = 'development' | 'production' | 'test' | 'staging';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
  type: 'postgres';
  url: string;
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

/**
 * Redis Configuration Interface
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number;
}

/**
 * Elasticsearch Configuration Interface
 */
export interface ElasticsearchConfig {
  node: string;
  maxRetries: number;
  requestTimeout: number;
  pingTimeout: number;
}

/**
 * MongoDB Configuration Interface
 */
export interface MongodbConfig {
  uri: string;
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

/**
 * Clerk Authentication Configuration Interface
 */
export interface ClerkConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

/**
 * Email Service Configuration Interface
 */
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

/**
 * Stripe Payment Configuration Interface
 */
export interface StripeConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

/**
 * AWS Configuration Interface
 */
export interface AwsConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
  s3Bucket?: string;
}

/**
 * Rate Limiting Configuration Interface
 */
export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

/**
 * Cache Configuration Interface
 */
export interface CacheConfig {
  ttl: number;
  store: string;
  host: string;
  port: number;
  password?: string;
}

/**
 * Logging Configuration Interface
 */
export interface LoggingConfig {
  level: LogLevel;
  toFile: boolean;
  errorLogPath: string;
  combinedLogPath: string;
}

/**
 * Security Configuration Interface
 */
export interface SecurityConfig {
  enableHelmet: boolean;
  enableCompression: boolean;
  corsOrigin: string;
}

/**
 * Health Check Configuration Interface
 */
export interface HealthCheckConfig {
  timeout: number;
}

/**
 * Complete Application Configuration Interface
 */
export interface AppConfig {
  port: number;
  nodeEnv: NodeEnvironment;
  database: typeof databaseConfig;
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
/**
 * Type for environment variable keys
 */
export type EnvKey = keyof typeof ENV_KEYS;

/**
 * Type guard to check if a string is a valid environment key
 */
export function isValidEnvKey(key: string): key is EnvKey {
  return Object.values(ENV_KEYS).includes(key as any);
}

/**
 * Default values for optional environment variables
 */
export const ENV_DEFAULTS = {
  PORT: 3000,
  NODE_ENV: 'development' as NodeEnvironment,
  CORS_ORIGIN: 'http://localhost:3000',
  REDIS_PASSWORD: '',
  AWS_REGION: 'us-east-1',
  THROTTLE_TTL: 60000,
  THROTTLE_LIMIT: 100,
  CACHE_TTL: 300,
  LOG_LEVEL: 'info' as LogLevel,
  LOG_TO_FILE: true,
  ENABLE_HELMET: true,
  ENABLE_COMPRESSION: true,
  HEALTH_CHECK_TIMEOUT: 5000,
  RABBITMQ_URL: 'amqp://localhost:5672',
} as const;
