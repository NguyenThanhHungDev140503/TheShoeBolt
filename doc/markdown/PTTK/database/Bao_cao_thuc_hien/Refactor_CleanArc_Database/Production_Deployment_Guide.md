# Production Deployment Guide - Database Layer Refactor

**Dự án:** TheShoeBolt Database Layer Refactor
**Phiên bản:** 1.0.0
**Ngày cập nhật:** 31/07/2025
**Tác giả:** Augment Agent

## Tổng quan

Hướng dẫn này cung cấp quy trình chi tiết để deploy database layer refactor lên production environment. Refactor đã di chuyển business logic từ stored procedures sang NestJS services theo Clean Architecture principles.

## Kiến trúc Sau Refactor

### Clean Architecture Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Controllers   │  │   Middlewares   │  │   Guards    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ ShippingService │  │ UsersService    │  │PaymentsServ.│ │
│  │                 │  │                 │  │             │ │
│  │ • assignShipper │  │ • registerUser  │  │• processRef.│ │
│  │ • validateRole  │  │ • validateUser  │  │• validateRef│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ TypeORM Repos   │  │ Simplified SPs  │  │ External    │ │
│  │                 │  │                 │  │ APIs        │ │
│  │ • User          │  │ • sp_assign_    │  │ • Stripe    │ │
│  │ • Payment       │  │   shipper_simple│  │ • Clerk     │ │
│  │ • Shipping      │  │ • sp_create_    │  │ • Email     │ │
│  └─────────────────┘  │   user_simple   │  └─────────────┘ │
│                       └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Refactored Components

#### 1. ShippingService
- **Business Logic:** Role validation, shipper assignment workflow
- **Database Operations:** `sp_assign_shipper_simple()`
- **Benefits:** Testable business logic, better error handling

#### 2. UsersService (Registration)
- **Business Logic:** Email/phone validation, user creation workflow
- **Database Operations:** `sp_create_user_simple()`, `sp_create_cart_simple()`, `sp_create_wishlist_simple()`
- **Benefits:** Transaction management, atomic operations

#### 3. PaymentsService (Refund)
- **Business Logic:** Refund validation, external API integration
- **Database Operations:** `sp_update_refund_status()`
- **Benefits:** External service integration, comprehensive validation

## Pre-Deployment Checklist

### 1. Environment Preparation

#### Server Requirements
- [ ] **OS:** Ubuntu 20.04+ hoặc CentOS 8+
- [ ] **RAM:** Minimum 8GB, Recommended 16GB+
- [ ] **CPU:** Minimum 4 cores, Recommended 8+ cores
- [ ] **Storage:** Minimum 100GB SSD, Recommended 500GB+ SSD
- [ ] **Network:** Stable internet connection, firewall configured

#### Software Dependencies
- [ ] **Docker:** Version 20.10+
- [ ] **Docker Compose:** Version 2.0+
- [ ] **Node.js:** Version 20+ (for local development)
- [ ] **PostgreSQL Client:** Version 15+ (for database management)

#### Security Setup
- [ ] **SSL Certificates:** Valid SSL certificates for HTTPS
- [ ] **Firewall:** Configured to allow only necessary ports
- [ ] **SSH Keys:** Secure SSH access configured
- [ ] **Secrets Management:** Environment variables secured

### 2. Configuration Files

#### Required Files
- [ ] `.env.production` - Production environment variables
- [ ] `docker-compose.prod.yml` - Production Docker configuration
- [ ] `Dockerfile.prod` - Production Docker image
- [ ] `monitoring/prometheus.yml` - Monitoring configuration

#### Database Setup
- [ ] **Backup Strategy:** Automated backup system configured
- [ ] **Connection Pool:** Optimized for production load
- [ ] **Indexes:** Performance indexes created
- [ ] **Monitoring:** Database monitoring enabled

## Deployment Process

### Step 1: Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/TheShoeBolt.git
cd TheShoeBolt

# 2. Create production environment file
cp .env.production.example .env.production
# Edit .env.production with your production values

# 3. Verify Docker installation
docker --version
docker-compose --version
```

### Step 2: Database Migration

```bash
# 1. Backup existing database
pg_dump -h your-db-host -U your-db-user -d your-db-name > backup_pre_refactor.sql

# 2. Apply database schema updates
docker-compose -f docker-compose.prod.yml exec postgres psql -U $DB_USERNAME -d $DB_NAME -f /docker-entrypoint-initdb.d/init.sql

# 3. Verify stored procedures
docker-compose -f docker-compose.prod.yml exec postgres psql -U $DB_USERNAME -d $DB_NAME -c "\df sp_*"
```

### Step 3: Application Deployment

```bash
# 1. Run deployment script
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh

# 2. Verify deployment
curl -f http://localhost:3000/health
curl -f http://localhost:3000/metrics
```

### Step 4: Monitoring Setup

```bash
# 1. Access Grafana dashboard
# URL: http://your-server:3001
# Username: admin
# Password: (from GRAFANA_PASSWORD in .env.production)

# 2. Verify Prometheus targets
# URL: http://your-server:9090/targets

# 3. Check application logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## Migration Strategy

### Phase 1: Parallel Deployment (Recommended)

#### Week 1-2: Preparation
1. **Deploy refactored services** alongside existing stored procedures
2. **Configure feature flags** to switch between old/new implementations
3. **Run comprehensive tests** in production-like environment
4. **Monitor performance** and error rates

#### Week 3-4: Gradual Migration
1. **Enable new services** for 10% of traffic
2. **Monitor metrics** and error rates closely
3. **Gradually increase** traffic to new services (25%, 50%, 75%)
4. **Rollback capability** maintained throughout

#### Week 5: Full Migration
1. **Switch 100% traffic** to new services
2. **Monitor for 1 week** to ensure stability
3. **Remove old stored procedures** after confirmation
4. **Update documentation** and team training

### Phase 2: Direct Migration (Advanced)

#### Prerequisites
- **Comprehensive testing** completed
- **Performance benchmarks** validated
- **Rollback plan** prepared
- **Team training** completed

#### Migration Steps
1. **Maintenance window** scheduled (2-4 hours)
2. **Database backup** created
3. **Application deployment** with new services
4. **Smoke tests** executed
5. **Traffic monitoring** for 24 hours

## Success Criteria

### Technical Metrics
- **Uptime:** >99.9% availability
- **Performance:** <500ms P95 response time
- **Error Rate:** <1% application errors
- **Database:** <100ms query response time

### Business Metrics
- **User Experience:** No degradation in user workflows
- **Feature Functionality:** All features working as expected
- **Data Integrity:** No data loss or corruption
- **Scalability:** System handles expected load
