# TheShoeBolt Technical Context

## Technology Stack

### Backend Core
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+
- **Package Manager**: npm/yarn

### Databases & Storage

#### Primary Database
- **PostgreSQL**: Main relational data (users, products, orders)
  - User profiles và authentication data
  - Product catalog với variants (size, color)
  - Order management và transaction history
  - Inventory tracking

#### Document Database  
- **MongoDB**: Unstructured data
  - Chat messages và conversation history
  - User activity logs
  - Content management (reviews, comments)
  - Session data

#### Caching Layer
- **Redis**: High-performance caching
  - User sessions
  - API response caching
  - Real-time data (cart contents)
  - Rate limiting data
  - WebSocket connection management

#### Search Engine
- **Elasticsearch**: Advanced search capabilities
  - Product search indexing
  - User behavior analytics
  - Search suggestions và autocomplete
  - Business intelligence data

### Communication & Integration

#### Real-time Communication
- **WebSocket**: Socket.io integration
  - Customer support chat
  - Real-time notifications
  - Order status updates
  - Admin dashboard live metrics

#### Message Queuing
- **Queue System**: Background job processing
  - Email sending queues
  - Payment processing workflows
  - Inventory updates
  - Analytics data processing

#### External Integrations
- **Payment Gateways**: Multiple payment processors
- **Email Service**: Transactional và marketing emails
- **SMS Service**: OTP và notifications
- **Logistics APIs**: Shipping và tracking integration

### Development & DevOps

#### Containerization
- **Docker**: Application containerization
  - Multi-stage builds cho optimization
  - Development environment consistency
  - Production deployment standardization

#### Database Management
- **TypeORM**: PostgreSQL ORM
  - Entity relationships management
  - Migration system
  - Query builder và raw SQL support
- **Mongoose**: MongoDB ODM
  - Schema definition và validation
  - Middleware hooks
  - Population và aggregation

#### Configuration Management
- **Environment Variables**: 
  - Development, staging, production configs
  - Sensitive data management
  - Feature flags

## Architecture Decisions

### Database Strategy: Multi-Database Approach

**Rationale**: Different data types require different storage solutions

```typescript
// Database configuration structure
const databaseConfig = {
  postgresql: {
    purpose: "ACID transactions, relational data",
    entities: ["User", "Product", "Order", "Payment"],
    features: ["Foreign keys", "Transactions", "Complex queries"]
  },
  mongodb: {
    purpose: "Flexible schema, high write volume",
    collections: ["ChatMessage", "UserLog", "Content"],
    features: ["Rapid development", "Scalability", "JSON-like documents"]
  },
  redis: {
    purpose: "High-speed caching and sessions",
    dataTypes: ["Strings", "Hashes", "Lists", "Sets"],
    features: ["Sub-millisecond latency", "Pub/Sub", "Atomic operations"]
  },
  elasticsearch: {
    purpose: "Full-text search and analytics",
    indices: ["products", "users", "orders"],
    features: ["Complex search", "Aggregations", "Real-time analytics"]
  }
}
```

### Authentication & Authorization Strategy

**JWT-based Authentication với Role-Based Access Control**

```typescript
// Security implementation approach
const securityStrategy = {
  authentication: {
    method: "JWT (JSON Web Tokens)",
    storage: "HTTP-only cookies + Authorization header",
    expiration: "Access: 15min, Refresh: 7 days",
    algorithms: ["RS256"]
  },
  authorization: {
    model: "RBAC (Role-Based Access Control)",
    roles: ["customer", "admin", "support", "manager"],
    permissions: "Fine-grained per endpoint",
    implementation: "NestJS Guards + Decorators"
  }
}
```

### Scalability Approach

**Vertical Scaling First, Horizontal Scaling Ready**

```typescript
// Scalability design decisions
const scalabilityStrategy = {
  current: {
    approach: "Modular Monolith",
    benefits: ["Simple deployment", "Consistent transactions", "Lower complexity"],
    limits: "Single instance scaling"
  },
  future: {
    approach: "Microservices Migration Path",
    modules: ["User Service", "Product Service", "Order Service", "Payment Service"],
    communication: "Event-driven + HTTP APIs",
    database: "Database per service pattern"
  }
}
```

## Development Environment

### Local Development Setup

```bash
# Required software stack
node --version          # >= 18.0.0
npm --version           # >= 8.0.0
docker --version        # >= 20.0.0
docker-compose --version # >= 2.0.0
postgresql --version    # >= 14.0
redis-server --version  # >= 6.0
```

### Environment Configuration

```typescript
// Environment variables structure
interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  APP_URL: string;
  
  // Databases
  DATABASE_URL: string;          // PostgreSQL
  MONGODB_URI: string;           // MongoDB
  REDIS_URL: string;             // Redis
  ELASTICSEARCH_URL: string;     // Elasticsearch
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  
  // External Services
  EMAIL_SERVICE_API_KEY: string;
  PAYMENT_GATEWAY_SECRET: string;
  SMS_SERVICE_TOKEN: string;
  
  // Features
  ENABLE_CHAT: boolean;
  ENABLE_ANALYTICS: boolean;
  DEBUG_MODE: boolean;
}
```

### Docker Compose Services

```yaml
# docker-compose.yml structure overview
services:
  app:              # Main NestJS application
  postgres:         # Primary database
  mongodb:          # Document database  
  redis:            # Caching layer
  elasticsearch:    # Search engine
  nginx:            # Reverse proxy (production)
```

## Technical Constraints & Decisions

### Performance Requirements

```typescript
const performanceTargets = {
  api: {
    responseTime: "< 200ms (95th percentile)",
    throughput: "> 1000 requests/second",
    uptime: "> 99.9%"
  },
  database: {
    queryTime: "< 50ms average",
    connections: "Pool size: 10-50",
    indexing: "All search fields indexed"
  },
  frontend: {
    loadTime: "< 2 seconds initial load",
    interactivity: "< 100ms UI response",
    caching: "Aggressive browser caching"
  }
}
```

### Security Constraints

```typescript
const securityRequirements = {
  dataProtection: {
    encryption: "AES-256 for sensitive data",
    hashing: "bcrypt for passwords",
    transmission: "TLS 1.3 minimum"
  },
  compliance: {
    standards: ["OWASP Top 10", "PCI DSS Level 1"],
    privacy: "GDPR compliant data handling",
    auditing: "Comprehensive audit logs"
  },
  access: {
    authentication: "Multi-factor where applicable",
    sessions: "Secure session management",
    api: "Rate limiting + API key validation"
  }
}
```

### Monitoring & Observability

```typescript
const observabilityStack = {
  logging: {
    library: "Winston + Morgan",
    levels: ["error", "warn", "info", "debug"],
    storage: "Structured logs to MongoDB + File system",
    monitoring: "Error tracking với alerts"
  },
  metrics: {
    collection: "Custom interceptors + Health checks",
    storage: "Time-series data in Elasticsearch",
    dashboards: "Admin panel metrics display"
  },
  tracing: {
    requests: "Request correlation IDs",
    database: "Query performance tracking",
    external: "API call monitoring"
  }
}
```

### Development Workflow

```typescript
const developmentProcess = {
  codeQuality: {
    linting: "ESLint + Prettier",
    testing: "Jest unit tests + E2E tests",
    coverage: "> 80% code coverage target",
    review: "Pull request reviews required"
  },
  deployment: {
    environments: ["development", "staging", "production"],
    strategy: "Blue-green deployment",
    rollback: "Automated rollback capability",
    monitoring: "Health checks post-deployment"
  },
  database: {
    migrations: "TypeORM migration system",
    seeding: "Automated test data seeding",
    backup: "Automated daily backups",
    versioning: "Schema version control"
  }
}
```

## Integration Architecture

### External Service Integration

```typescript
const externalIntegrations = {
  payments: {
    primary: "Stripe/PayPal integration",
    fallback: "Multiple payment gateway support",
    webhooks: "Async payment status updates",
    security: "PCI DSS compliant handling"
  },
  shipping: {
    carriers: ["FedEx", "UPS", "DHL", "Local carriers"],
    tracking: "Real-time shipment tracking",
    rates: "Dynamic shipping rate calculation",
    labels: "Automated label generation"
  },
  communication: {
    email: "Transactional + Marketing campaigns",
    sms: "OTP + Order notifications",
    push: "Mobile app notifications",
    chat: "Real-time customer support"
  }
}
```

### API Design Principles

```typescript
const apiDesign = {
  restful: {
    conventions: "RESTful API design patterns",
    versioning: "URL path versioning (/api/v1/)",
    documentation: "OpenAPI/Swagger specifications",
    testing: "Comprehensive API test suite"
  },
  websocket: {
    namespaces: "Feature-based namespaces",
    authentication: "JWT token validation",
    events: "Standardized event naming",
    fallback: "Graceful degradation to HTTP polling"
  },
  graphql: {
    future: "Considered for mobile app optimization",
    benefits: "Reduced data transfer",
    complexity: "Additional learning curve",
    decision: "REST-first, GraphQL when needed"
  }
}
```

Technology stack này được chọn để đảm bảo:
- **Scalability**: Có thể xử lý growth từ startup đến enterprise
- **Maintainability**: Modern stack với good community support
- **Performance**: Optimized cho e-commerce workloads
- **Developer Experience**: Productive development environment
- **Business Flexibility**: Easy to adapt cho changing requirements