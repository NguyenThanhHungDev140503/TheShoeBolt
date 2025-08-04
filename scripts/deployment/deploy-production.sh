#!/bin/bash

# Production Deployment Script for TheShoeBolt
# This script deploys the refactored database layer to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="theshoebolt"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
LOG_FILE="/var/log/${PROJECT_NAME}/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."

    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found. Please create it from .env.production.example"
    fi

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is not installed. Please install it first."
    fi

    # Check disk space (minimum 5GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 5242880 ]; then  # 5GB in KB
        warning "Low disk space detected. Available: $(($available_space/1024/1024))GB"
    fi

    success "Pre-deployment checks completed"
}

# Database backup
backup_database() {
    log "Creating database backup..."

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Get database credentials from environment
    source .env.production

    # Create backup filename with timestamp
    backup_file="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"

    # Create database backup
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$DB_USERNAME" -d "$DB_NAME" > "$backup_file"; then
        success "Database backup created: $backup_file"
    else
        error "Failed to create database backup"
    fi
}

# Build and deploy
deploy_application() {
    log "Building and deploying application..."

    # Pull latest images
    log "Pulling latest base images..."
    docker-compose -f docker-compose.prod.yml pull

    # Build application
    log "Building application..."
    docker-compose -f docker-compose.prod.yml build --no-cache

    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down

    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d

    success "Application deployed successfully"
}

# Health checks
health_checks() {
    log "Performing health checks..."

    # Wait for services to start
    sleep 30

    # Check application health
    max_attempts=10
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            success "Application health check passed"
            break
        else
            log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
            sleep 10
            ((attempt++))
        fi
    done

    if [ $attempt -gt $max_attempts ]; then
        error "Application health check failed after $max_attempts attempts"
    fi

    # Check database connection
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U "$DB_USERNAME" -d "$DB_NAME" > /dev/null 2>&1; then
        success "Database health check passed"
    else
        error "Database health check failed"
    fi
}

# Main deployment process
main() {
    log "Starting production deployment for $PROJECT_NAME"

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    # Run deployment steps
    pre_deployment_checks
    backup_database
    deploy_application
    health_checks

    success "Production deployment completed successfully!"
    log "Application is now running at: http://localhost:3000"
}

# Script execution
main
