#!/bin/bash

# Production Status Check Script
# This script provides comprehensive diagnostics for production deployment

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

log "🔍 Starting comprehensive production status check..."

# Check if we're in the right directory
if [ ! -d "$APP_DIR" ]; then
    error "Production directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"
log "📁 Working directory: $(pwd)"

# 1. Check Docker service status
log "🐳 Checking Docker service status..."
if systemctl is-active --quiet docker; then
    success "Docker service is running"
else
    error "Docker service is not running"
    log "Attempting to start Docker service..."
    sudo systemctl start docker
    sleep 3
    if systemctl is-active --quiet docker; then
        success "Docker service started successfully"
    else
        error "Failed to start Docker service"
    fi
fi

# 2. Check Docker Compose file
log "📄 Checking Docker Compose configuration..."
if [ -f "$COMPOSE_FILE" ]; then
    success "Docker Compose file found: $COMPOSE_FILE"
    log "Compose file contents:"
    head -20 "$COMPOSE_FILE"
else
    error "Docker Compose file not found: $COMPOSE_FILE"
    log "Available files:"
    ls -la *.yml *.yaml 2>/dev/null || echo "No compose files found"
fi

# 3. Check environment files
log "🔧 Checking environment configuration..."
if [ -f ".env.production" ]; then
    success "Production environment file found"
    log "Environment variables (first 10):"
    head -10 .env.production
else
    warning "Production environment file not found"
    if [ -f ".env.production.example" ]; then
        log "Example file found - you may need to copy it"
    fi
fi

# 4. Check Docker containers
log "📦 Checking Docker containers..."
echo "=== Running Containers ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Container Logs (last 20 lines each) ==="

# Check specific containers
containers=("basa-app-prod" "basa-postgres-prod")
for container in "${containers[@]}"; do
    if docker ps -q -f name="$container" | grep -q .; then
        success "Container $container is running"
        log "Recent logs for $container:"
        docker logs --tail 20 "$container" 2>/dev/null || echo "No logs available"
    else
        error "Container $container is not running"
        if docker ps -a -q -f name="$container" | grep -q .; then
            log "Container exists but not running. Status:"
            docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "$container"
            log "Last logs before stopping:"
            docker logs --tail 20 "$container" 2>/dev/null || echo "No logs available"
        else
            log "Container $container does not exist"
        fi
    fi
    echo ""
done

# 5. Check Docker Compose status
log "🔍 Checking Docker Compose status..."
if [ -f "$COMPOSE_FILE" ]; then
    echo "=== Docker Compose Status ==="
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    echo "=== Docker Compose Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail 30
fi

# 6. Check system resources
log "💻 Checking system resources..."
echo "=== System Resources ==="
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h
echo ""
echo "CPU load:"
uptime

# 7. Check network connectivity
log "🌐 Checking network connectivity..."
echo "=== Network Status ==="
echo "Port 3000 (app):"
netstat -tlnp | grep :3000 || echo "Port 3000 not listening"
echo ""
echo "Port 5432 (database):"
netstat -tlnp | grep :5432 || echo "Port 5432 not listening"

# 8. Check application health
log "🏥 Checking application health..."
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    success "Application health check passed"
    log "Health response:"
    curl -s http://localhost:3000/api/health | head -5
else
    error "Application health check failed"
    log "Attempting to check with more details:"
    curl -v http://localhost:3000/api/health 2>&1 | head -10
fi

# 9. Check recent deployment logs
log "📋 Checking recent deployment activity..."
echo "=== Recent Deployment Logs ==="
if [ -f "deployment.log" ]; then
    tail -20 deployment.log
else
    log "No deployment log file found"
fi

# 10. Provide recommendations
log "💡 Recommendations:"
echo ""

if ! docker ps -q -f name="basa-app-prod" | grep -q .; then
    warning "Main application container is not running"
    echo "  - Run: docker-compose -f $COMPOSE_FILE up -d"
    echo "  - Check logs: docker-compose -f $COMPOSE_FILE logs"
fi

if ! docker ps -q -f name="basa-postgres-prod" | grep -q .; then
    warning "Database container is not running"
    echo "  - Check database logs: docker logs basa-postgres-prod"
    echo "  - Verify environment variables"
fi

if [ ! -f ".env.production" ]; then
    warning "Production environment file missing"
    echo "  - Copy: cp .env.production.example .env.production"
    echo "  - Edit with your production values"
fi

success "Production status check completed!" 