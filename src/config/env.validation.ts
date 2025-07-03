import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsUrl,
  IsEmail,
  IsPort,
  IsBoolean,
  validateSync,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';

/**
 * Environment Variables Validation Schema
 * Validates all required and optional environment variables for TheShoeBolt application
 */
export class EnvironmentVariables {
  // Application Settings
  @IsOptional()
  @IsPort()
  @Transform(({ value }) => parseInt(value, 10))
  PORT?: number = 3000;

  @IsIn(['development', 'production', 'test', 'staging'])
  NODE_ENV: string = 'development';

  @IsOptional()
  @IsUrl({ require_tld: false })
  CORS_ORIGIN?: string = 'http://localhost:3000';

  // Database Configuration (PostgreSQL)
  @IsString()
  @Length(1, 255)
  DB_HOST: string;

  @IsPort()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT: number;

  @IsString()
  @Length(1, 63)
  DB_USERNAME: string;

  @IsString()
  @Length(1, 255)
  DB_PASSWORD: string;

  @IsString()
  @Length(1, 63)
  DB_NAME: string;

  // Redis Configuration
  @IsString()
  @Length(1, 255)
  REDIS_HOST: string;

  @IsPort()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  // Elasticsearch Configuration
  @IsUrl({ require_tld: false })
  ES_NODE: string;

  // MongoDB Configuration
  @IsString()
  @Matches(/^mongodb:\/\/.*/, {
    message: 'MONGODB_URI must be a valid MongoDB connection string',
  })
  MONGODB_URI: string;

  // Clerk Authentication (Required)
  @IsString()
  @Length(32, 512)
  @Matches(/^sk_/, {
    message: 'CLERK_SECRET_KEY must start with sk_',
  })
  CLERK_SECRET_KEY: string;

  @IsString()
  @Length(32, 512)
  @Matches(/^pk_/, {
    message: 'CLERK_PUBLISHABLE_KEY must start with pk_',
  })
  CLERK_PUBLISHABLE_KEY: string;

  @IsString()
  @Length(32, 512)
  @Matches(/^whsec_/, {
    message: 'CLERK_WEBHOOK_SECRET must start with whsec_',
  })
  CLERK_WEBHOOK_SECRET: string;

  // Email Service Configuration
  @IsString()
  @Length(1, 255)
  EMAIL_HOST: string;

  @IsPort()
  @Transform(({ value }) => parseInt(value, 10))
  EMAIL_PORT: number;

  @IsEmail()
  EMAIL_AUTH_USER: string;

  @IsString()
  @Length(1, 255)
  EMAIL_AUTH_PASSWORD: string;

  @IsEmail()
  EMAIL_FROM: string;

  // JWT Configuration (Legacy - Optional for backward compatibility)
  @IsOptional()
  @IsString()
  @Length(32, 512)
  JWT_SECRET?: string;

  // Stripe Configuration (Optional - for payments)
  @IsOptional()
  @IsString()
  @Matches(/^sk_/, {
    message: 'STRIPE_SECRET_KEY must start with sk_',
  })
  STRIPE_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  @Matches(/^pk_/, {
    message: 'STRIPE_PUBLISHABLE_KEY must start with pk_',
  })
  STRIPE_PUBLISHABLE_KEY?: string;

  @IsOptional()
  @IsString()
  @Matches(/^whsec_/, {
    message: 'STRIPE_WEBHOOK_SECRET must start with whsec_',
  })
  STRIPE_WEBHOOK_SECRET?: string;

  // RabbitMQ Configuration (Optional)
  @IsOptional()
  @IsString()
  RABBITMQ_URL?: string = 'amqp://localhost:5672';

  // File Storage Configuration (Optional)
  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  AWS_REGION?: string = 'us-east-1';

  @IsOptional()
  @IsString()
  AWS_S3_BUCKET?: string;

  // Rate Limiting Configuration (Optional)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_TTL?: number = 60000;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_LIMIT?: number = 100;

  // Cache Configuration (Optional)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(86400)
  @Transform(({ value }) => parseInt(value, 10))
  CACHE_TTL?: number = 300;

  // Logging Configuration (Optional)
  @IsOptional()
  @IsIn(['error', 'warn', 'info', 'debug', 'verbose'])
  LOG_LEVEL?: string = 'info';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  LOG_TO_FILE?: boolean = true;

  // Security Configuration (Optional)
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_HELMET?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_COMPRESSION?: boolean = true;

  // Health Check Configuration (Optional)
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(60000)
  @Transform(({ value }) => parseInt(value, 10))
  HEALTH_CHECK_TIMEOUT?: number = 5000;
}

/**
 * Validates environment variables and returns validated configuration
 * @param config Raw environment variables object
 * @returns Validated environment configuration
 * @throws Error if validation fails
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints ? Object.values(error.constraints) : [];
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}

/**
 * Environment validation configuration for ConfigModule
 */
export const envValidationConfig = {
  validate: validateEnvironment,
  validationOptions: {
    allowUnknown: false,
    abortEarly: false,
  },
};
