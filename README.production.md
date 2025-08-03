# TheShoeBolt - Production Deployment

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM, 4+ CPU cores
- Valid SSL certificates

### 1. Environment Setup
```bash
# Clone and setup
git clone https://github.com/your-org/TheShoeBolt.git
cd TheShoeBolt

# Configure production environment
cp .env.production.example .env.production
# Edit .env.production with your production values
```

### 2. Deploy
```bash
# Run deployment script
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh
```

### 3. Verify
```bash
# Check health
curl -f http://localhost:3000/health

# Check metrics
curl -f http://localhost:3000/metrics

# Access monitoring
# Grafana: http://localhost:3001 (admin/your-password)
# Prometheus: http://localhost:9090
```

## Architecture Overview

### Refactored Database Layer
- **ShippingService:** Role validation + simplified stored procedures
- **UsersService:** Registration workflow + atomic operations
- **PaymentsService:** Refund processing + external API integration

### Clean Architecture Benefits
- ✅ Testable business logic
- ✅ Better error handling
- ✅ Improved maintainability
- ✅ External service integration

## Monitoring & Alerts

### Key Metrics
- **Application:** Request rate, response time, error rate
- **Database:** Connection pool, query performance, storage
- **Business:** Shipper assignment, user registration, refund processing

### Alert Thresholds
- **Critical:** >10% error rate, health check failures
- **Warning:** >5% error rate, performance degradation

## Support

### Troubleshooting
1. **Database Issues:** Check connection pool and credentials
2. **High Memory:** Optimize queries, implement caching
3. **Slow Response:** Add indexes, scale resources

### Emergency Contacts
- **Technical Lead:** [Contact Info]
- **DevOps:** [Contact Info]
- **On-Call:** [Contact Info]

## Documentation
- **Full Deployment Guide:** `doc/markdown/PTTK/database/Production_Deployment_Guide.md`
- **Architecture Details:** `doc/markdown/PTTK/database/Ke_hoach_cai_thien/`
- **Test Reports:** `doc/markdown/PTTK/database/Bao_cao_thuc_hien/`

---
**Version:** 1.0.0 | **Last Updated:** 31/07/2025
