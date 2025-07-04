/**
 * Environment Configuration Types
 * Provides type-safe access to environment variables throughout the application
 */

export type NodeEnvironment = 'development' | 'production' | 'test' | 'staging';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Database Configuration Interface
 */
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

/**
 * Environment Variable Keys
 * Used for type-safe access to process.env
 */
export const ENV_KEYS = {
  // Application
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  CORS_ORIGIN: 'CORS_ORIGIN',

  // Database
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_NAME: 'DB_NAME',

  // Redis
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',

  // Elasticsearch
  ES_NODE: 'ES_NODE',

  // MongoDB
  MONGODB_URI: 'MONGODB_URI',

  // Clerk
  CLERK_SECRET_KEY: 'CLERK_SECRET_KEY',
  CLERK_PUBLISHABLE_KEY: 'CLERK_PUBLISHABLE_KEY',
  CLERK_WEBHOOK_SECRET: 'CLERK_WEBHOOK_SECRET',

  // Email
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_AUTH_USER: 'EMAIL_AUTH_USER',
  EMAIL_AUTH_PASSWORD: 'EMAIL_AUTH_PASSWORD',
  EMAIL_FROM: 'EMAIL_FROM',

  // Stripe
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  STRIPE_PUBLISHABLE_KEY: 'STRIPE_PUBLISHABLE_KEY',
  STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',

  // AWS
  AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
  AWS_REGION: 'AWS_REGION',
  AWS_S3_BUCKET: 'AWS_S3_BUCKET',

  // Rate Limiting
  THROTTLE_TTL: 'THROTTLE_TTL',
  THROTTLE_LIMIT: 'THROTTLE_LIMIT',

  // Cache
  CACHE_TTL: 'CACHE_TTL',

  // Logging
  LOG_LEVEL: 'LOG_LEVEL',
  LOG_TO_FILE: 'LOG_TO_FILE',

  // Security
  ENABLE_HELMET: 'ENABLE_HELMET',
  ENABLE_COMPRESSION: 'ENABLE_COMPRESSION',

  // Health Check
  HEALTH_CHECK_TIMEOUT: 'HEALTH_CHECK_TIMEOUT',

  // Optional
  RABBITMQ_URL: 'RABBITMQ_URL',
  JWT_SECRET: 'JWT_SECRET',
} as const;

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
