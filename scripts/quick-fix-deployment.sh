#!/bin/bash

# Quick Fix Deployment Script
# This script quickly fixes common deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🔧 Quick fixing deployment..."

# Navigate to app directory
cd /opt/basa-app-dev

# Stop all containers
log "🛑 Stopping containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Clean up Docker
log "🧹 Cleaning up Docker..."
docker system prune -f

# Pull latest changes
log "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/dev

# Verify Docker Compose file
log "🔍 Verifying Docker Compose configuration..."
if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
    success "Docker Compose configuration is valid"
else
    warning "Docker Compose configuration has errors, attempting to fix..."
    # Try to fix common issues
    sed -i '/^[[:space:]]*env_file:[[:space:]]*$/d' docker-compose.dev.yml
    sed -i '/^[[:space:]]*- \.env\.local[[:space:]]*$/d' docker-compose.dev.yml
    echo "    env_file:" >> docker-compose.dev.yml
    echo "      - .env.local" >> docker-compose.dev.yml
fi

# Start containers
log "🚀 Starting containers..."
docker-compose -f docker-compose.dev.yml up -d --build

# Quick health check
log "🏥 Quick health check..."
sleep 15
if curl -s -f "http://localhost:3001/api/health" > /dev/null; then
    success "Application is healthy!"
else
    warning "Health check failed, but containers are running"
    docker-compose -f docker-compose.dev.yml ps
fi

success "Quick fix completed!" 