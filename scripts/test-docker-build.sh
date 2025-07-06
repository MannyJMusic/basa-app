#!/bin/bash

# Test Docker Build Script
# This script tests the Docker build locally to ensure it works

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

log "🧪 Testing Docker build locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
    exit 1
fi

# Clean up any existing test images
log "🧹 Cleaning up existing test images..."
docker rmi basa-app-test:latest 2>/dev/null || true
docker rmi basa-app-test:base 2>/dev/null || true

# Test the build
log "🔨 Building Docker image..."
if docker build -t basa-app-test:latest .; then
    success "Docker build completed successfully!"
else
    error "Docker build failed!"
    exit 1
fi

# Test running the container
log "🚀 Testing container startup..."
container_id=$(docker run -d --name basa-app-test-container \
    -e NODE_ENV=production \
    -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
    -e NEXTAUTH_URL="http://localhost:3000" \
    -e NEXTAUTH_SECRET="test-secret" \
    -e STRIPE_SECRET_KEY="sk_test_test" \
    -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_test" \
    -e MAILGUN_API_KEY="test" \
    -e MAILGUN_DOMAIN="test.com" \
    -e MAILGUN_FROM_EMAIL="test@test.com" \
    basa-app-test:latest)

# Wait a moment for the container to start
sleep 5

# Check if container is running
if docker ps -q -f name=basa-app-test-container | grep -q .; then
    success "Container started successfully!"
    
    # Check container logs
    log "📋 Container logs:"
    docker logs basa-app-test-container --tail 20
    
    # Clean up
    log "🧹 Cleaning up test container..."
    docker stop basa-app-test-container
    docker rm basa-app-test-container
    docker rmi basa-app-test:latest
    
    success "Docker build test completed successfully!"
else
    error "Container failed to start!"
    log "Container logs:"
    docker logs basa-app-test-container --tail 50
    
    # Clean up
    docker rm -f basa-app-test-container 2>/dev/null || true
    docker rmi basa-app-test:latest 2>/dev/null || true
    
    exit 1
fi 