# TheShoeBolt System Patterns & Architecture

## Kiến Trúc Tổng Quan

### Architecture Style
**Modular Monolith với Microservices Readiness**

Dự án sử dụng NestJS module system để tạo ra clear boundaries giữa các domain, chuẩn bị cho việc tách thành microservices sau này nếu cần.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │   Admin Panel   │
└─────┬───────────┘    └─────┬───────────┘    └─────┬───────────┘
      │                      │                      │
      └──────────────────────┼──────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (NestJS App)  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   Business    │ │   Support   │ │   Admin     │
    │   Modules     │ │   Modules   │ │   Modules   │
    └───────┬───────┘ └──────┬──────┘ └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Data Layer     │
                    │  Multi-DB       │
                    └─────────────────┘
```

## Core Design Patterns

### 1. Module Pattern (NestJS)

**Cách thức tổ chức code theo business domains:**

```typescript
// Mỗi module đóng gói một business capability
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

**Key Modules trong hệ thống:**
- `UsersModule`: User management (tương tác với Clerk và có thể cả DB cục bộ)
- `AdminModule`: Administrative functions
- `AuthModule`: Authentication và authorization (sử dụng Clerk)
- `ClerkModule`: Tích hợp và quản lý Clerk SDK
- `ChatModule`: Real-time customer support
- `PaymentsModule`: Payment processing
- `EmailsModule`: Email notifications
- `ElasticsearchModule`: Search functionality
- `QueuesModule`: Background job processing

### 2. Multi-Database Pattern

**Strategy: Database per concern**

```typescript
// Primary databases cho different data types
const databases = {
  postgresql: "User data, orders, products",
  mongodb: "Chat messages, logs, sessions", 
  redis: "Caching, sessions, real-time data",
  elasticsearch: "Search indexing, analytics"
}
```

**Benefits:**
- Optimal performance cho từng data type
- Scalability per database requirement
- Technology flexibility cho different use cases

### 3. Controller-Service-Repository Pattern

**Layered Architecture Implementation:**

```typescript
// Controller Layer - API endpoints
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
}

// Service Layer - Business logic
@Injectable()
export class UsersService {
  constructor(private usersRepository: Repository<User>) {}
}

// Repository Layer - Data access (TypeORM)
```

### 4. DTO Pattern

**Data Transfer Objects cho validation và type safety:**

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @MinLength(8)
  password: string;
}
```

### 5. Guard Pattern

**Authentication và Authorization (sử dụng Clerk):**

```typescript
// Clerk Authentication Guard (sẽ được tạo)
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  // Logic xác thực request sử dụng Clerk SDK
  // Gắn thông tin user/auth vào request
}

// Role-based Authorization Guard (sử dụng thông tin từ Clerk)
@Injectable()
export class RolesGuard implements CanActivate {
  // Role checking logic, đọc vai trò từ user.publicMetadata (Clerk)
}
```

### 6. WebSocket Gateway Pattern

**Real-time Communication:**

```typescript
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  // Real-time chat implementation
}
```

## Data Flow Patterns

### 1. Request-Response Flow

```
Client Request → ClerkAuthGuard → Controller → Service → Repository → Database
(Token Validation by Clerk)      ↓
Client ← Response Transform ← Business Logic ← Data Query
```

### 2. Real-time Communication Flow

```
Client WebSocket → Gateway → Service → Broadcast
                            ↓
                      Redis PubSub → All Connected Clients
```

### 3. Background Processing Flow

```
API Request → Queue Job → Background Worker → External Service
           ↓
    Immediate Response    Async Processing    Result Callback
```

## Security Patterns

### 1. Clerk Authentication Strategy

Clerk sẽ quản lý việc tạo và xác minh JWT. Backend NestJS sẽ sử dụng Clerk SDK để xác thực các token này.

```typescript
// ClerkAuthGuard (chi tiết hơn ở mục Guard Pattern)
// Sẽ sử dụng clerk.authenticateRequest() để xác thực token.
// Không cần JwtStrategy truyền thống nếu ClerkAuthGuard xử lý toàn bộ.

// (Nếu vẫn dùng Passport với Clerk, JwtStrategy sẽ cần cấu hình để
// xác minh token của Clerk, có thể qua JWKS URI của Clerk)
```
Hệ thống sẽ dựa vào Clerk để quản lý phiên người dùng, MFA, social logins, v.v.

### 2. Role-Based Access Control (RBAC)

```typescript
// Roles decorator pattern
@Roles('admin', 'moderator')
@UseGuards(ClerkAuthGuard, RolesGuard) // Sử dụng ClerkAuthGuard
@Post()
adminOnlyEndpoint() {
  // Logic của endpoint
}
// RolesGuard sẽ đọc thông tin vai trò từ user object do ClerkAuthGuard cung cấp,
// thường là từ user.publicMetadata.roles.
```

### 3. Input Validation Pattern

```typescript
// Global validation pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
}));
```

## Error Handling Patterns

### 1. Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Centralized error handling
  }
}
```

### 2. Custom Business Exceptions

```typescript
export class UserNotFoundError extends HttpException {
  constructor() {
    super('User not found', HttpStatus.NOT_FOUND);
  }
}
```

## Performance Patterns

### 1. Caching Strategy

```typescript
// Redis caching for frequently accessed data
@Injectable()
export class CacheService {
  // Multi-level caching implementation
}
```

### 2. Database Connection Pooling

```typescript
// Optimized database connections
TypeOrmModule.forRoot({
  // Connection pooling configuration
  extra: {
    max: 20,
    min: 5,
    acquireTimeoutMillis: 60000
  }
});
```

### 3. Queue Processing Pattern

```typescript
// Background job processing
@Processor('email-queue')
export class EmailProcessor {
  @Process('send-welcome-email')
  async handleWelcomeEmail(job: Job) {
    // Async email processing
  }
}
```

## Monitoring & Observability Patterns

### 1. Health Check Pattern

```typescript
@Controller('health')
export class HealthController {
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Various health indicators
    ]);
  }
}
```

### 2. Logging Pattern

```typescript
// Structured logging throughout application
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Request/response logging
  }
}
```

### 3. Metrics Collection

```typescript
// Performance metrics tracking
export class TransformInterceptor implements NestInterceptor {
  // Response time và success rate tracking
}
```

## Deployment Patterns

### 1. Containerization

```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
# Build stage

FROM node:18-alpine AS production  
# Production stage
```

### 2. Environment Configuration

```typescript
// Configuration management
@Injectable()
export class ConfigService {
  // Environment-specific configuration
}
```

### 3. Database Migration Pattern

```typescript
// TypeORM migrations for schema changes
export class CreateUserTable implements MigrationInterface {
  // Database schema evolution
}
```

## Integration Patterns

### 1. External API Integration

```typescript
// HTTP client for external services
@Injectable()
export class PaymentService {
  // Payment gateway integration
}
```

### 2. Event-Driven Communication

```typescript
// Internal event system
@Injectable()
export class EventEmitterService {
  // Loose coupling via events
}
```

### 3. File Upload Pattern

```typescript
// Multer integration for file handling
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  // File processing logic
}
```

Các patterns này tạo ra một hệ thống có tính:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Modular architecture cho easy scaling
- **Reliability**: Error handling và monitoring comprehensive
- **Security**: Multi-layer security implementation
- **Performance**: Caching, queuing, và database optimization