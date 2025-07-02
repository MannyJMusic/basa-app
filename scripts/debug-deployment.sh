#!/bin/bash

# Debug Deployment Script
# This script helps identify issues with the deployment

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
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🔍 Starting deployment debugging..."

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    error "docker-compose.dev.yml not found. Are you in the correct directory?"
    exit 1
fi

# Check Docker status
log "🐳 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running or not accessible"
    exit 1
else
    success "Docker is running"
fi

# Check Docker Compose
log "🐳 Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed"
    exit 1
else
    success "Docker Compose is available"
fi

# Check if containers are running
log "📊 Checking container status..."
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    success "Containers are running"
    docker-compose -f docker-compose.dev.yml ps
else
    warning "No containers are running"
fi

# Check port availability
log "🔌 Checking port availability..."
if netstat -tuln | grep -q ":3001 "; then
    success "Port 3001 is in use"
else
    warning "Port 3001 is not in use"
fi

# Check if application is responding
log "🏥 Testing application health..."
if curl -s -f "http://localhost:3001/api/health" > /dev/null; then
    success "Health endpoint is responding"
    curl -s "http://localhost:3001/api/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/api/health"
else
    error "Health endpoint is not responding"
fi

# Check container logs
log "📋 Recent container logs:"
docker-compose -f docker-compose.dev.yml logs --tail=20

# Check environment variables
log "⚙️ Checking environment variables..."
if [ -f ".env.local" ]; then
    success "Environment file exists"
    echo "DATABASE_URL: $(grep DATABASE_URL .env.local | cut -d'=' -f2 | cut -d'"' -f2)"
    echo "NEXTAUTH_URL: $(grep NEXTAUTH_URL .env.local | cut -d'=' -f2 | cut -d'"' -f2)"
else
    error "Environment file .env.local not found"
fi

# Check database connection
log "🗄️ Testing database connection..."
if docker exec basa-postgres-dev pg_isready -U basa_user -d basa_dev > /dev/null 2>&1; then
    success "Database is accepting connections"
else
    error "Database is not accepting connections"
fi

# Check disk space
log "💾 Checking disk space..."
df -h | grep -E "(Filesystem|/opt)"

# Check memory usage
log "🧠 Checking memory usage..."
free -h

# Check Docker resources
log "🐳 Checking Docker resources..."
docker system df

# Check if the application is actually listening on the port
log "🔍 Checking if application is listening on port 3001..."
if docker exec basa-app-dev netstat -tuln | grep -q ":3000 "; then
    success "Application is listening on port 3000 inside container"
else
    error "Application is not listening on port 3000 inside container"
fi

# Check if port is properly mapped
log "🔗 Checking port mapping..."
if docker port basa-app-dev | grep -q "3000->3001"; then
    success "Port mapping is correct (3000->3001)"
else
    warning "Port mapping might be incorrect"
    docker port basa-app-dev
fi

log "🔍 Debugging completed!" 