# Environment Configuration

Hệ thống Environment Validation cho TheShoeBolt đảm bảo tất cả các biến môi trường được validate và type-safe trước khi ứng dụng khởi động.

## Tổng quan

Environment validation system bao gồm:

- **env.validation.ts**: Schema validation sử dụng class-validator
- **env.types.ts**: TypeScript types và interfaces
- **env.config.ts**: Service cung cấp type-safe access
- **Configuration files**: Database, Redis, Elasticsearch, MongoDB configs

## Cấu trúc Files

```
src/config/
├── env.validation.ts     # Validation schema
├── env.types.ts         # TypeScript types
├── env.config.ts        # Configuration service
├── database.config.ts   # Database configuration
├── redis.config.ts      # Redis configuration
├── elasticsearch.config.ts # Elasticsearch configuration
├── mongodb.config.ts    # MongoDB configuration
└── README.md           # Documentation này
```

## Environment Variables

### Required Variables

#### Database (PostgreSQL)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=theshoebolt
```

#### Redis
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password
```

#### Elasticsearch
```bash
ES_NODE=http://localhost:9200
```

#### MongoDB
```bash
MONGODB_URI=mongodb://localhost:27017/theshoebolt
```

#### Clerk Authentication
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

#### Email Service
```bash
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_AUTH_USER=user@example.com
EMAIL_AUTH_PASSWORD=password
EMAIL_FROM=noreply@example.com
```

### Optional Variables

#### Application Settings
```bash
PORT=3000                           # Default: 3000
NODE_ENV=development                # Default: development
CORS_ORIGIN=http://localhost:3000   # Default: http://localhost:3000
```

#### Stripe Payment (Optional)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### AWS Configuration (Optional)
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1               # Default: us-east-1
AWS_S3_BUCKET=your_bucket_name
```

#### Rate Limiting
```bash
THROTTLE_TTL=60000                 # Default: 60000ms
THROTTLE_LIMIT=100                 # Default: 100 requests
```

#### Cache Configuration
```bash
CACHE_TTL=300                      # Default: 300 seconds
```

#### Logging
```bash
LOG_LEVEL=info                     # Default: info
LOG_TO_FILE=true                   # Default: true
```

#### Security
```bash
ENABLE_HELMET=true                 # Default: true
ENABLE_COMPRESSION=true            # Default: true
```

#### Health Check
```bash
HEALTH_CHECK_TIMEOUT=5000          # Default: 5000ms
```

#### Legacy/Optional
```bash
JWT_SECRET=your_jwt_secret         # Legacy, optional
RABBITMQ_URL=amqp://localhost:5672 # Default: amqp://localhost:5672
```

## Validation Rules

### String Validation
- **Length**: Minimum và maximum length constraints
- **Format**: Email, URL, pattern matching
- **Required**: Non-empty strings cho required fields

### Number Validation
- **Port**: Valid port numbers (1-65535)
- **Range**: Min/max values cho specific fields
- **Transform**: Automatic string to number conversion

### Boolean Validation
- **Transform**: String 'true'/'false' to boolean
- **Default**: Fallback values cho optional booleans

### Custom Validation
- **Clerk Keys**: Must start with appropriate prefixes (sk_, pk_, whsec_)
- **Stripe Keys**: Must start with appropriate prefixes (sk_, pk_, whsec_)
- **MongoDB URI**: Must be valid MongoDB connection string
- **URLs**: Must be valid URLs với optional TLD requirement

## Usage

### Trong AppModule
```typescript
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvironment,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
  ],
})
export class AppModule {}
```

### Trong Services
```typescript
import { EnvConfigService } from './config/env.config';

@Injectable()
export class SomeService {
  constructor(private readonly envConfig: EnvConfigService) {}

  someMethod() {
    const dbConfig = this.envConfig.database;
    const redisConfig = this.envConfig.redis;
    // Type-safe access to all configurations
  }
}
```

### Type-safe Access
```typescript
// Get specific configurations
const port = envConfig.port;                    // number
const nodeEnv = envConfig.nodeEnv;              // 'development' | 'production' | 'test' | 'staging'
const isDev = envConfig.isDevelopment;          // boolean
const dbConfig = envConfig.database;           // DatabaseConfig
const clerkConfig = envConfig.clerk;           // ClerkConfig

// Get complete app configuration
const appConfig = envConfig.appConfig;         // AppConfig
```

## Error Handling

### Validation Errors
Khi environment variables không hợp lệ, application sẽ fail to start với detailed error messages:

```
Environment validation failed:
DB_HOST: DB_HOST should not be empty
DB_PORT: DB_PORT must be a port
CLERK_SECRET_KEY: CLERK_SECRET_KEY must start with sk_
```

### Missing Required Variables
```
Missing required environment variables: DB_HOST, DB_PORT, CLERK_SECRET_KEY
```

## Best Practices

1. **Always use EnvConfigService** thay vì direct process.env access
2. **Set up .env files** cho different environments
3. **Use type-safe access** thông qua EnvConfigService methods
4. **Validate early** - Environment validation runs at application startup
5. **Document changes** - Update README khi thêm new environment variables

## Testing

Environment validation có comprehensive test suite covering:
- Valid configurations
- Invalid configurations
- Missing required variables
- Type transformations
- Default values
- Edge cases

Run tests:
```bash
npm run test src/config/env.validation.spec.ts
```

## Troubleshooting

### Common Issues

1. **Application won't start**: Check environment variables against required list
2. **Type errors**: Ensure EnvConfigService is properly injected
3. **Validation failures**: Check format requirements (URLs, emails, key prefixes)
4. **Missing defaults**: Optional variables should have sensible defaults

### Debug Mode

Set `LOG_LEVEL=debug` để see detailed configuration loading information.
