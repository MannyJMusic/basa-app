#!/bin/bash

# Fix Production Containers Script
# This script fixes common issues and restarts production containers

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

# Configuration
APP_DIR="/opt/basa-app-prod"
COMPOSE_FILE="docker-compose.prod.yml"

log "🔧 Starting production container fix..."

# Navigate to app directory
cd "$APP_DIR" || {
    error "Cannot navigate to $APP_DIR"
    exit 1
}

log "📁 Working directory: $(pwd)"

# 1. Ensure Docker service is running
log "🐳 Ensuring Docker service is running..."
if ! systemctl is-active --quiet docker; then
    log "Starting Docker service..."
    sudo systemctl start docker
    sleep 5
fi

if systemctl is-active --quiet docker; then
    success "Docker service is running"
else
    error "Failed to start Docker service"
    exit 1
fi

# 2. Stop any existing containers
log "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || {
    warning "Some containers may not have stopped cleanly"
}

# 3. Clean up any dangling containers/images
log "🧹 Cleaning up Docker resources..."
docker system prune -f 2>/dev/null || true
docker container prune -f 2>/dev/null || true

# 4. Check environment file
log "🔧 Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    warning "Production environment file not found"
    if [ -f ".env.production.example" ]; then
        log "Copying example environment file..."
        cp .env.production.example .env.production
        warning "⚠️  Please edit .env.production with your production values"
        warning "⚠️  Then run this script again"
        exit 1
    else
        error "No environment file found"
        exit 1
    fi
else
    success "Production environment file found"
fi

# 5. Validate Docker Compose file
log "📄 Validating Docker Compose configuration..."
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Validate compose file
if docker-compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
    success "Docker Compose configuration is valid"
else
    error "Docker Compose configuration is invalid"
    log "Configuration errors:"
    docker-compose -f "$COMPOSE_FILE" config
    exit 1
fi

# 6. Start containers
log "🚀 Starting production containers..."
docker-compose -f "$COMPOSE_FILE" up -d

# 7. Wait for containers to start
log "⏳ Waiting for containers to start..."
sleep 10

# 8. Check container status
log "🔍 Checking container status..."
docker-compose -f "$COMPOSE_FILE" ps

# 9. Check container health
log "🏥 Checking container health..."
containers=("basa-app-prod" "basa-postgres-prod")
all_healthy=true

for container in "${containers[@]}"; do
    if docker ps -q -f name="$container" | grep -q .; then
        status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
        if [ "$status" = "running" ]; then
            success "Container $container is running"
            
            # Check if it's healthy (if health check is configured)
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
            if [ "$health" = "healthy" ]; then
                success "Container $container is healthy"
            elif [ "$health" = "no-health-check" ]; then
                log "Container $container has no health check configured"
            else
                warning "Container $container health status: $health"
                all_healthy=false
            fi
        else
            error "Container $container is not running (status: $status)"
            all_healthy=false
        fi
    else
        error "Container $container is not running"
        all_healthy=false
    fi
done

# 10. Check application health
log "🌐 Checking application health..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Application health check passed"
        break
    else
        attempt=$((attempt + 1))
        log "Health check attempt $attempt/$max_attempts failed, waiting..."
        sleep 5
    fi
done

if [ $attempt -eq $max_attempts ]; then
    error "Application health check failed after $max_attempts attempts"
    log "Container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail 50
    all_healthy=false
fi

# 11. Show final status
echo ""
log "📊 Final Status Report:"
echo "======================"

if $all_healthy; then
    success "All containers are running and healthy!"
    echo ""
    log "Application URLs:"
    echo "  - Main app: http://localhost:3000"
    echo "  - Health check: http://localhost:3000/api/health"
    echo ""
    log "Useful commands:"
    echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  - Stop containers: docker-compose -f $COMPOSE_FILE down"
    echo "  - Restart containers: docker-compose -f $COMPOSE_FILE restart"
else
    warning "Some containers may have issues"
    echo ""
    log "Troubleshooting commands:"
    echo "  - View all logs: docker-compose -f $COMPOSE_FILE logs"
    echo "  - View specific container: docker logs basa-app-prod"
    echo "  - Check container status: docker-compose -f $COMPOSE_FILE ps"
    echo "  - Restart specific container: docker-compose -f $COMPOSE_FILE restart basa-app-prod"
fi

success "Production container fix completed!" 