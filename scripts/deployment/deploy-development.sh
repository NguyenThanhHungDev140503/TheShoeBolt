#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Pre-deployment checks for development
pre_deployment_checks_dev() {
    log "Starting pre-deployment checks for development..."

    if [ ! -f ".env.development" ]; then
        error ".env.development file not found. Please create it from .env.example"
    fi

    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is not installed. Please install it first."
    fi

    success "Pre-deployment checks completed for development."
}

# Build and deploy for development
deploy_application_dev() {
    log "Building and deploying application for development..."

    log "Building application images..."
    docker-compose -f docker-compose.yml build --no-cache

    log "Stopping existing services (if any)..."
    docker-compose -f docker-compose.yml down

    log "Starting services..."
    docker-compose -f docker-compose.yml up -d

    success "Application deployed successfully for development."
}

# Database setup for development (optional)
setup_database_dev() {
    log "Setting up database for development (migrations and seeding)..."

    # Example for NestJS/TypeORM migrations (adjust based on actual project setup)
    # docker-compose exec app npm run typeorm migration:run

    # Example for seeding data (adjust based on actual project setup)
    # docker-compose exec app npm run seed

    success "Database setup completed for development."
}

# Simple health check for development
health_check_dev() {
    log "Performing simple health check for development..."

    sleep 10 # Give services some time to start

    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Application is running and accessible."
    else
        error "Application did not respond to health check."
    fi
}

# Main development deployment process
main_dev() {
    log "Starting development deployment for TheShoeBolt"

    pre_deployment_checks_dev
    deploy_application_dev
    setup_database_dev # Optional: Uncomment if you need database setup
    health_check_dev

    success "Development deployment completed successfully!"
    log "Application should be accessible at: http://localhost:3000"
}

# Script execution
main_dev