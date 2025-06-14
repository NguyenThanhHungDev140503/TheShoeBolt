# Technical Context - NestJS Backend System

## Technology Stack

### Core Framework
- **NestJS 10.x**: Modern Node.js framework với TypeScript
- **TypeScript**: Type safety và better developer experience
- **Node.js 18+**: Runtime environment

### Database & ORM
- **PostgreSQL 15**: Primary database
- **TypeORM 0.3.x**: Object-Relational Mapping
- **Database Migrations**: Version control cho database schema

### Caching & Session
- **Redis 7**: In-memory caching và session storage
- **cache-manager**: Caching abstraction layer

### Message Queue
- **RabbitMQ 3**: Async message processing
- **amqplib**: RabbitMQ client library

### External Services
- **Stripe**: Payment processing
- **Resend**: Email delivery service

### Security & Authentication
- **JWT**: JSON Web Tokens cho authentication
- **bcryptjs**: Password hashing
- **Passport**: Authentication middleware
- **Helmet**: Security headers
- **Rate Limiting**: Request throttling

### Development Tools
- **Docker & Docker Compose**: Containerization
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality
- **Winston**: Logging
- **Swagger/OpenAPI**: API documentation

## Environment Configuration

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=nestjs_backend

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# JWT
JWT_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@domain.com
```

## Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Setup environment variables
4. Start services: `docker-compose up -d`
5. Run migrations: `npm run migration:run`
6. Start development: `npm run start:dev`

## Production Considerations
- Environment-specific configurations
- Database connection pooling
- Redis clustering for high availability
- Load balancing
- SSL/TLS termination
- Monitoring và alerting
- Backup strategies