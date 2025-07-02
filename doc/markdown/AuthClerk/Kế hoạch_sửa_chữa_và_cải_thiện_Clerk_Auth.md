# KẾ HOẠCH SỬA CHỮA VÀ CẢI THIỆN CLERK AUTH

## 📋 Executive Summary

Với vai trò **Senior Tech Lead**, tôi đã phân tích toàn diện 18 vấn đề nghiêm trọng trong module Clerk & Auth của TheShoeBolt. Kế hoạch này cung cấp roadmap chi tiết để team development triển khai ngay, đảm bảo security, performance và maintainability đạt production-ready standard.

**🚨 Tình huống khẩn cấp:** `@clerk/clerk-sdk-node` đã EOL vào 10/01/2025, migration sang `@clerk/backend` là bắt buộc.

**📊 Phân loại vấn đề:**
- **Critical Security Issues:** 7 vấn đề (39%)
- **Medium Priority:** 6 vấn đề (33%) 
- **Low Priority:** 5 vấn đề (28%)

**⏱️ Timeline tổng thể:** 8 tuần (4 phases)
**👥 Resource yêu cầu:** 2 Senior Developers + 1 QA Engineer
**💰 Estimated effort:** 320 person-hours

---

## 🎯 Phân tích Ưu tiên và Chiến lược

### Phase 1: Critical Security Fixes (Tuần 1-2) - 🔴 URGENT
**Mục tiêu:** Loại bỏ security vulnerabilities nghiêm trọng

| Vấn đề | Mức độ | Effort (hours) | Owner |
|--------|--------|----------------|-------|
| #1: SDK Migration | Critical | 16h | Senior Dev 1 |
| #4: Authentication Method | Critical | 12h | Senior Dev 1 |
| #2: ClerkClient Provider | Critical | 8h | Senior Dev 2 |
| #7: Role Checking Logic | Critical | 6h | Senior Dev 2 |
| #16: Multiple Roles Logic | Critical | 4h | Senior Dev 2 |
| #3: JWT Key Implementation | High | 4h | Senior Dev 1 |

**Total Phase 1:** 50 hours

### Phase 2: Core Functionality (Tuần 3-4) - 🟡 HIGH
**Mục tiêu:** Implement missing core features

| Vấn đề | Effort (hours) | Owner |
|--------|----------------|-------|
| #5: Webhook Implementation | 20h | Senior Dev 1 |
| #6: Error Handling | 16h | Senior Dev 2 |
| #8: Input Validation | 12h | Senior Dev 2 |
| #10: Rate Limiting | 8h | Senior Dev 1 |

**Total Phase 2:** 56 hours

### Phase 3: Quality & Testing (Tuần 5-6) - 🟢 MEDIUM
**Mục tiêu:** Comprehensive testing và monitoring

| Vấn đề | Effort (hours) | Owner |
|--------|----------------|-------|
| #11: Testing Coverage | 32h | QA Engineer + Dev Team |
| #12: Config Validation | 8h | Senior Dev 2 |
| #13: Monitoring | 16h | Senior Dev 1 |

**Total Phase 3:** 56 hours

### Phase 4: Production Readiness (Tuần 7-8) - 🔵 LOW
**Mục tiêu:** Polish và documentation

| Vấn đề | Effort (hours) | Owner |
|--------|----------------|-------|
| #9: Response Format | 12h | Senior Dev 2 |
| #14: Documentation | 24h | Senior Dev 1 |
| #15: Module Architecture | 16h | Senior Dev 1 |

**Total Phase 4:** 52 hours

---

## 🔧 Chi tiết Giải pháp - Phase 1 (Critical)

### Vấn đề #1: SDK Migration (16h)

#### 🔍 Root Cause Analysis
- `@clerk/clerk-sdk-node` deprecated và EOL 10/01/2025
- Security vulnerabilities không được patch
- Performance degradation với modern Node.js versions

#### 💡 Technical Solution

**Step 1: Dependency Migration (2h)**
```bash
# Remove deprecated SDK
npm uninstall @clerk/clerk-sdk-node

# Install new backend SDK
npm install @clerk/backend

# Update package.json
npm audit fix
```

**Step 2: ClerkClient Provider Implementation (6h)**
```typescript
// src/providers/clerk-client.provider.ts
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

export const ClerkClientProvider: Provider = {
  provide: 'ClerkClient',
  useFactory: (configService: ConfigService) => {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    const jwtKey = configService.get<string>('CLERK_JWT_KEY');
    
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is required');
    }

    return createClerkClient({
      secretKey,
      jwtKey, // Enable networkless verification
    });
  },
  inject: [ConfigService],
};
```

**Step 3: Service Refactoring (8h)**
```typescript
// src/modules/Infrastructure/clerk/clerk.session.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkSessionService {
  private readonly logger = new Logger(ClerkSessionService.name);

  constructor(
    @Inject('ClerkClient') private readonly clerkClient: ClerkClient,
  ) {}

  async getSessionList(userId: string) {
    try {
      this.logger.debug(`Getting sessions for user: ${userId}`);
      const sessions = await this.clerkClient.sessions.getSessionList({ userId });
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get sessions for user ${userId}:`, error);
      throw this.handleClerkError(error);
    }
  }

  private handleClerkError(error: any) {
    if (error.status === 404) {
      throw new NotFoundException('User not found');
    }
    if (error.status === 403) {
      throw new ForbiddenException('Access denied');
    }
    throw new InternalServerErrorException('Clerk service error');
  }
}
```

#### 🧪 Testing Strategy

**Unit Tests (4h)**
```typescript
// clerk.session.service.spec.ts
describe('ClerkSessionService', () => {
  let service: ClerkSessionService;
  let mockClerkClient: jest.Mocked<ClerkClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ClerkSessionService,
        { provide: 'ClerkClient', useValue: mockClerkClient },
      ],
    }).compile();

    service = module.get<ClerkSessionService>(ClerkSessionService);
  });

  it('should get user sessions successfully', async () => {
    const mockSessions = [{ id: 'sess_123', userId: 'user_456' }];
    mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessions);

    const result = await service.getSessionList('user_456');
    expect(result).toEqual(mockSessions);
  });

  it('should handle 404 errors gracefully', async () => {
    mockClerkClient.sessions.getSessionList.mockRejectedValue({ status: 404 });

    await expect(service.getSessionList('invalid_user')).rejects.toThrow(NotFoundException);
  });
});
```

#### ✅ Definition of Done
- [ ] All imports updated to `@clerk/backend`
- [ ] ClerkClient provider implemented with DI
- [ ] All services refactored to use injected client
- [ ] Unit tests pass with >95% coverage
- [ ] Integration tests verify API compatibility
- [ ] No deprecated warnings in build
- [ ] Performance benchmarks show <100ms auth latency
- [ ] Security audit confirms no vulnerabilities

---

### Vấn đề #4: Authentication Method Fix (12h)

#### 🔍 Root Cause Analysis
- ClerkAuthGuard sử dụng `verifyToken()` thay vì `authenticateRequest()`
- Không tuân theo Clerk best practices cho Guards/Middleware
- Manual token extraction thay vì automatic header/cookie parsing

#### 💡 Technical Solution

**Guard Refactoring (8h)**
```typescript
// src/modules/Infrastructure/clerk/guards/clerk-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { authenticateRequest } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const { sessionId, userId, orgId, claims } = await authenticateRequest({
        headers: request.headers,
        cookies: request.cookies,
      }, {
        jwtKey: this.configService.get('CLERK_JWT_KEY'),
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
        authorizedParties: [this.configService.get('CLERK_FRONTEND_API_URL')],
      });

      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Attach user info to request
      request['clerkUser'] = { sessionId, userId, orgId, claims };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
```

#### 🧪 Testing Strategy (4h)
```typescript
describe('ClerkAuthGuard', () => {
  it('should authenticate valid requests', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer valid_token' },
      cookies: { __session: 'valid_session' },
    };

    jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
      .mockResolvedValue({ userId: 'user_123', sessionId: 'sess_456' });

    const result = await guard.canActivate(createMockContext(mockRequest));
    expect(result).toBe(true);
    expect(mockRequest['clerkUser']).toBeDefined();
  });
});
```

#### ✅ Definition of Done
- [ ] Guard uses `authenticateRequest()` method
- [ ] Automatic header/cookie parsing implemented
- [ ] Error handling covers all auth failure scenarios
- [ ] Unit tests achieve 100% coverage
- [ ] Integration tests verify auth flows
- [ ] Performance tests show <50ms guard execution
- [ ] Documentation updated with new usage patterns

---

## 📊 Risk Management & Mitigation

### High-Risk Areas

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Breaking changes during SDK migration | High | Critical | Comprehensive testing + gradual rollout |
| Performance degradation | Medium | High | Benchmark before/after + optimization |
| Security vulnerabilities during transition | Medium | Critical | Security audit + penetration testing |
| Team knowledge gap | Low | Medium | Training sessions + documentation |

### Rollback Strategy
- Maintain feature flags for gradual rollout
- Database migration scripts with rollback procedures
- Automated deployment with health checks
- 24/7 monitoring during critical phases

---

## 📈 Success Metrics & Monitoring

### Key Performance Indicators

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Authentication Latency | ~200ms | <100ms | APM monitoring |
| Security Vulnerabilities | 7 Critical | 0 Critical | Security scans |
| Test Coverage | ~60% | >95% | Jest reports |
| API Error Rate | ~5% | <1% | Error tracking |
| Documentation Coverage | ~30% | 100% | Manual audit |

### Monitoring Implementation
```typescript
// Prometheus metrics for auth performance
const authDuration = new Histogram({
  name: 'clerk_auth_duration_seconds',
  help: 'Authentication duration',
  labelNames: ['endpoint', 'status'],
});

const authAttempts = new Counter({
  name: 'clerk_auth_attempts_total',
  help: 'Total auth attempts',
  labelNames: ['status', 'method'],
});
```

---

## 👥 Team Assignment & Communication

### Roles & Responsibilities

**Senior Developer 1 (Lead)**
- SDK Migration (#1)
- Webhook Implementation (#5)
- Monitoring Setup (#13)
- Architecture Review (#15)

**Senior Developer 2**
- Authentication Guards (#4, #7, #16)
- Error Handling (#6)
- Input Validation (#8)
- Configuration (#12)

**QA Engineer**
- Test Strategy Design
- Test Implementation (#11)
- Security Testing
- Performance Testing

### Communication Plan
- **Daily Standups:** Progress tracking + blocker resolution
- **Weekly Reviews:** Phase completion + quality gates
- **Milestone Demos:** Stakeholder alignment
- **Post-Implementation:** Retrospective + lessons learned

---

## 🎯 Next Steps

1. **Immediate Actions (Week 1)**
   - Team kickoff meeting
   - Environment setup
   - SDK migration start
   - Security audit baseline

2. **Phase Gates**
   - Each phase requires sign-off from Tech Lead
   - Security review before production deployment
   - Performance benchmarks validation
   - Documentation completeness check

3. **Long-term Maintenance**
   - Monthly security reviews
   - Quarterly performance optimization
   - Annual architecture assessment
   - Continuous dependency updates

---

## 🔧 Chi tiết Giải pháp - Phase 2 (Core Functionality)

### Vấn đề #5: Webhook Implementation (20h)

#### 🔍 Root Cause Analysis
- Thiếu real-time sync giữa Clerk và local database
- Không nhận được notifications khi user data thay đổi
- Manual sync dẫn đến data inconsistency

#### 💡 Technical Solution

**Webhook Controller (12h)**
```typescript
// src/webhook/webhook.controller.ts
import { Controller, Post, Req, Res, RawBodyRequest } from '@nestjs/common';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';

@Controller('api/webhooks')
export class WebhookController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const WEBHOOK_SECRET = this.configService.get('CLERK_WEBHOOK_SIGNING_SECRET');

    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
    }

    const body = req.rawBody;
    const headers = {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    };

    let evt: WebhookEvent;

    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      evt = wh.verify(body, headers) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Handle different event types
    switch (evt.type) {
      case 'user.created':
        await this.authService.syncUserFromClerk(evt.data);
        break;
      case 'user.updated':
        await this.authService.updateUserFromClerk(evt.data);
        break;
      case 'user.deleted':
        await this.authService.deleteUser(evt.data.id);
        break;
      case 'session.created':
        await this.authService.logSessionCreated(evt.data);
        break;
      case 'session.ended':
        await this.authService.logSessionEnded(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  }
}
```

**Service Implementation (8h)**
```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}

  async syncUserFromClerk(clerkUser: any) {
    try {
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.email_addresses[0]?.email_address,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        role: clerkUser.public_metadata?.role || UserRole.USER,
        createdAt: new Date(clerkUser.created_at),
      };

      await this.usersService.createFromClerk(userData);
      this.logger.log(`User synced from Clerk: ${clerkUser.id}`);
    } catch (error) {
      this.logger.error(`Failed to sync user from Clerk: ${clerkUser.id}`, error);
      throw error;
    }
  }

  async updateUserFromClerk(clerkUser: any) {
    try {
      const updateData = {
        email: clerkUser.email_addresses[0]?.email_address,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        role: clerkUser.public_metadata?.role,
        updatedAt: new Date(),
      };

      await this.usersService.updateByClerkId(clerkUser.id, updateData);
      this.logger.log(`User updated from Clerk: ${clerkUser.id}`);
    } catch (error) {
      this.logger.error(`Failed to update user from Clerk: ${clerkUser.id}`, error);
      throw error;
    }
  }
}
```

#### 🧪 Testing Strategy
```typescript
describe('WebhookController', () => {
  it('should process user.created webhook', async () => {
    const mockWebhookPayload = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
      },
    };

    jest.spyOn(authService, 'syncUserFromClerk').mockResolvedValue(undefined);

    const response = await request(app.getHttpServer())
      .post('/api/webhooks/clerk')
      .send(mockWebhookPayload)
      .expect(200);

    expect(authService.syncUserFromClerk).toHaveBeenCalledWith(mockWebhookPayload.data);
  });
});
```

#### ✅ Definition of Done
- [ ] Webhook endpoint handles all Clerk event types
- [ ] Signature verification implemented
- [ ] Error handling for malformed payloads
- [ ] Database sync logic tested
- [ ] Retry mechanism for failed webhooks
- [ ] Monitoring and alerting setup
- [ ] Documentation for webhook configuration

### Vấn đề #6: Comprehensive Error Handling (16h)

#### 🔍 Root Cause Analysis
- Generic error messages không cung cấp context
- Thiếu structured logging cho debugging
- Security information leakage trong error responses
- Không handle specific Clerk API errors

#### 💡 Technical Solution

**Global Exception Filter (8h)**
```typescript
// src/common/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        errorCode = (errorResponse as any).errorCode || this.getErrorCode(status);
      } else {
        message = errorResponse as string;
      }
    } else if (this.isClerkError(exception)) {
      ({ status, message, errorCode } = this.handleClerkError(exception));
    }

    // Log error details (but not in response)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send sanitized response
    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message: this.sanitizeErrorMessage(message, status),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isClerkError(exception: any): boolean {
    return exception?.clerkError || exception?.status >= 400;
  }

  private handleClerkError(error: any) {
    switch (error.status) {
      case 401:
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Authentication required',
          errorCode: 'AUTH_REQUIRED',
        };
      case 403:
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Insufficient permissions',
          errorCode: 'INSUFFICIENT_PERMISSIONS',
        };
      case 404:
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          errorCode: 'RESOURCE_NOT_FOUND',
        };
      case 429:
        return {
          status: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'External service error',
          errorCode: 'EXTERNAL_SERVICE_ERROR',
        };
    }
  }

  private sanitizeErrorMessage(message: string, status: number): string {
    // Don't expose internal details in production
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      return 'An unexpected error occurred. Please try again later.';
    }
    return message;
  }

  private getErrorCode(status: number): string {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
```

**Clerk-specific Error Handler (8h)**
```typescript
// src/modules/Infrastructure/clerk/clerk-error.handler.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ClerkErrorHandler {
  private readonly logger = new Logger(ClerkErrorHandler.name);

  handleError(error: any, context: string): never {
    this.logger.error(`Clerk error in ${context}:`, {
      status: error.status,
      message: error.message,
      clerkTraceId: error.clerkTraceId,
      timestamp: new Date().toISOString(),
    });

    switch (error.status) {
      case 400:
        throw new BadRequestException('Invalid request parameters');
      case 401:
        throw new UnauthorizedException('Authentication failed');
      case 403:
        throw new ForbiddenException('Access denied');
      case 404:
        throw new NotFoundException('Resource not found');
      case 422:
        throw new UnprocessableEntityException('Validation failed');
      case 429:
        throw new TooManyRequestsException('Rate limit exceeded');
      default:
        throw new InternalServerErrorException('Authentication service unavailable');
    }
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !this.isRetryableError(error)) {
          break;
        }

        const delay = backoffMs * Math.pow(2, attempt - 1);
        this.logger.warn(`Retrying operation in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await this.sleep(delay);
      }
    }

    this.handleError(lastError, 'retry-operation');
  }

  private isRetryableError(error: any): boolean {
    return error.status >= 500 || error.status === 429;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### ✅ Definition of Done
- [ ] Global exception filter handles all error types
- [ ] Clerk-specific errors mapped to appropriate HTTP codes
- [ ] Structured logging implemented
- [ ] Error messages sanitized for production
- [ ] Retry mechanism for transient failures
- [ ] Error monitoring and alerting setup
- [ ] Unit tests cover all error scenarios

---

## 🔧 Chi tiết Giải pháp - Phase 3 (Quality & Testing)

### Vấn đề #11: Comprehensive Testing Coverage (32h)

#### 🔍 Root Cause Analysis
- Current test coverage ~60%, không đủ cho production
- Thiếu integration tests cho auth flows
- Không test error scenarios và edge cases
- Mock strategies không realistic

#### 💡 Technical Solution

**Unit Testing Strategy (16h)**
```typescript
// test/unit/clerk-auth.guard.spec.ts
describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                CLERK_JWT_KEY: 'test-jwt-key',
                CLERK_SECRET_KEY: 'test-secret-key',
                CLERK_FRONTEND_API_URL: 'https://test.clerk.accounts.dev',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('canActivate', () => {
    it('should return true for valid authentication', async () => {
      const mockContext = createMockExecutionContext({
        headers: { authorization: 'Bearer valid_token' },
        cookies: { __session: 'valid_session' },
      });

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockResolvedValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          claims: { sub: 'user_456' },
        });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockContext.switchToHttp().getRequest()['clerkUser']).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const mockContext = createMockExecutionContext({
        headers: { authorization: 'Bearer invalid_token' },
      });

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no userId returned', async () => {
      const mockContext = createMockExecutionContext({
        headers: { authorization: 'Bearer token_without_user' },
      });

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockResolvedValue({
          sessionId: null,
          userId: null,
          orgId: null,
          claims: {},
        });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

**Integration Testing Strategy (16h)**
```typescript
// test/integration/auth-flow.integration.spec.ts
describe('Authentication Flow Integration', () => {
  let app: INestApplication;
  let clerkClient: ClerkClient;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('ClerkClient')
    .useValue(createMockClerkClient())
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    clerkClient = app.get('ClerkClient');
  });

  describe('Protected Endpoints', () => {
    it('should allow access with valid authentication', async () => {
      const mockUser = {
        sessionId: 'sess_123',
        userId: 'user_456',
        claims: { sub: 'user_456' },
      };

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get('/clerk/sessions')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/clerk/sessions')
        .expect(401)
        .expect((res) => {
          expect(res.body.errorCode).toBe('AUTH_REQUIRED');
          expect(res.body.success).toBe(false);
        });
    });

    it('should handle Clerk API errors gracefully', async () => {
      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockRejectedValue({ status: 429, message: 'Rate limit exceeded' });

      await request(app.getHttpServer())
        .get('/clerk/sessions')
        .set('Authorization', 'Bearer rate_limited_token')
        .expect(429)
        .expect((res) => {
          expect(res.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
        });
    });
  });

  describe('Role-based Authorization', () => {
    it('should allow admin access to admin endpoints', async () => {
      const mockAdminUser = {
        sessionId: 'sess_admin',
        userId: 'user_admin',
        claims: {
          sub: 'user_admin',
          public_metadata: { role: 'ADMIN' }
        },
      };

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockResolvedValue(mockAdminUser);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/user_123/sessions')
        .set('Authorization', 'Bearer admin_token')
        .expect(200);
    });

    it('should deny regular user access to admin endpoints', async () => {
      const mockRegularUser = {
        sessionId: 'sess_user',
        userId: 'user_regular',
        claims: {
          sub: 'user_regular',
          public_metadata: { role: 'USER' }
        },
      };

      jest.spyOn(require('@clerk/backend'), 'authenticateRequest')
        .mockResolvedValue(mockRegularUser);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/user_123/sessions')
        .set('Authorization', 'Bearer user_token')
        .expect(403)
        .expect((res) => {
          expect(res.body.errorCode).toBe('INSUFFICIENT_PERMISSIONS');
        });
    });
  });
});
```

#### ✅ Definition of Done
- [ ] Unit test coverage >95% for all auth modules
- [ ] Integration tests cover all auth flows
- [ ] E2E tests verify complete user journeys
- [ ] Performance tests validate auth latency <100ms
- [ ] Security tests check for common vulnerabilities
- [ ] Mock strategies realistic and maintainable
- [ ] Test documentation and examples provided
- [ ] CI/CD pipeline runs all tests automatically

---

*Kế hoạch này được thiết kế để đảm bảo TheShoeBolt đạt enterprise-level security và performance standards. Mọi thay đổi sẽ được track và review kỹ lưỡng để đảm bảo chất lượng cao nhất.*
