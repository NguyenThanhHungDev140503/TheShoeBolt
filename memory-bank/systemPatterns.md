# System Patterns - NestJS Backend System

## Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   NestJS API    │
│   Applications  │◄──►│   (Optional)    │◄──►│   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   Redis Cache   │◄───────────┤
                       └─────────────────┘            │
                                                       │
                       ┌─────────────────┐            │
                       │   PostgreSQL    │◄───────────┤
                       │   Database      │            │
                       └─────────────────┘            │
                                                       │
                       ┌─────────────────┐            │
                       │   RabbitMQ      │◄───────────┤
                       │   Message Queue │            │
                       └─────────────────┘            │
                                                       │
                       ┌─────────────────┐            │
                       │   External APIs │◄───────────┘
                       │   (Stripe,      │
                       │    Resend)      │
                       └─────────────────┘
```

## Design Patterns

### Module Pattern
- Mỗi feature được tổ chức thành module riêng biệt
- Clear separation of concerns
- Dependency injection container

### Repository Pattern
- Data access layer abstraction với TypeORM
- Testable và maintainable data operations

### Strategy Pattern
- Authentication strategies (Local, JWT)
- Payment processing strategies

### Observer Pattern
- Event-driven architecture với RabbitMQ
- Async processing cho email notifications

### Decorator Pattern
- Guards cho authentication/authorization
- Interceptors cho logging và transformation
- Pipes cho validation

## Key Components

### Core Modules
- `AuthModule`: JWT authentication & authorization
- `UsersModule`: User management với caching
- `PaymentsModule`: Stripe integration
- `EmailsModule`: Resend email service
- `QueuesModule`: RabbitMQ message processing
- `HealthModule`: System health monitoring

### Infrastructure
- Global exception filters
- Request/response interceptors
- Validation pipes
- Rate limiting
- CORS configuration
- Security headers (Helmet)

### Data Layer
- TypeORM entities với relationships
- Database migrations
- Connection pooling
- Query optimization với indexes