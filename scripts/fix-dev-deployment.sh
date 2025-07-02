#!/bin/bash

# Fix Development Deployment Script
# This script cleans up Docker and restarts the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🔧 Fixing development deployment..."

# Navigate to app directory
cd /opt/basa-app-dev

# Stop all containers
log "🛑 Stopping all containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Remove all containers and images for this project
log "🧹 Cleaning up Docker resources..."
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# Pull latest changes
log "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/dev

# Verify the docker-compose file is correct
log "🔍 Verifying docker-compose configuration..."
if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
    success "Docker Compose configuration is valid"
else
    error "Docker Compose configuration has errors"
fi

# Build and start containers
log "🔨 Building and starting containers..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for containers to start
log "⏳ Waiting for containers to start..."
sleep 30

# Check container status
log "📊 Container status:"
docker-compose -f docker-compose.dev.yml ps

# Check logs
log "📋 Recent logs:"
docker-compose -f docker-compose.dev.yml logs --tail=20

# Health check
log "🏥 Checking application health..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f "http://localhost:3001/api/health" > /dev/null; then
        success "Application is healthy!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        warning "Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 10 seconds..."
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Application health check failed after $MAX_RETRIES attempts"
    log "📋 Full container logs:"
    docker-compose -f docker-compose.dev.yml logs
    exit 1
fi

success "🎉 Development deployment fixed successfully!"
log "🌐 Application is running at: http://localhost:3001" 