#!/bin/bash

# Deployment Script Without Git Requirements
# This script deploys the application without requiring Git write permissions

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
ENV_FILE=".env.production"
PORT=3000
BRANCH="main"

log "🚀 Starting BASA Production Deployment (No-Git Mode)..."

# Navigate to app directory
if [ ! -d "$APP_DIR" ]; then
    error "Production directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"
log "📁 Working directory: $(pwd)"
log "👤 Current user: $(whoami)"

# Check if we can read the current code
if [ ! -f "package.json" ]; then
    error "package.json not found. Application files may be missing."
    exit 1
fi

# Check Docker service
log "🐳 Checking Docker service..."
if ! systemctl is-active --quiet docker; then
    log "Starting Docker service..."
    sudo systemctl start docker
    sleep 3
fi

if systemctl is-active --quiet docker; then
    success "Docker service is running"
else
    error "Docker service is not running"
    exit 1
fi

# Check environment file
log "🔧 Checking environment configuration..."
if [ ! -f "$ENV_FILE" ]; then
    error "Production environment file not found: $ENV_FILE"
    echo ""
    echo "To fix this issue:"
    echo "1. Copy the example file: cp .env.production.example .env.production"
    echo "2. Edit .env.production with your actual production values"
    echo "3. Make sure to set these REQUIRED variables:"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_URL"
    echo "   - NEXTAUTH_SECRET"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "   - MAILGUN_API_KEY"
    echo "   - MAILGUN_DOMAIN"
    echo "   - MAILGUN_FROM_EMAIL"
    exit 1
fi

# Validate environment variables
log "🔍 Validating environment variables..."
required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "MAILGUN_API_KEY"
    "MAILGUN_DOMAIN"
    "MAILGUN_FROM_EMAIL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" || grep -q "^${var}=\"\"$" "$ENV_FILE" || grep -q "^${var}=your-" "$ENV_FILE"; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    error "Missing or invalid required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please update $ENV_FILE with valid values for these variables."
    exit 1
fi

success "Environment variables validated successfully"

# Check Docker Compose file
log "📄 Checking Docker Compose configuration..."
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

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans 2>/dev/null || {
    warning "Some containers may not have stopped cleanly"
}

# Clean up old images (optional)
log "🧹 Cleaning up old Docker images..."
docker image prune -f 2>/dev/null || true

# Build and start containers
log "🔨 Building and starting containers..."
if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build; then
    success "Containers built and started successfully"
else
    error "Failed to build and start containers"
    log "Container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    exit 1
fi

# Wait for containers to be healthy
log "⏳ Waiting for containers to be healthy..."
sleep 30

# Check container status
log "🔍 Checking container status..."
docker-compose -f "$COMPOSE_FILE" ps

# Check application health
log "🏥 Checking application health..."
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
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
    log "📋 Container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    log "🔍 Container status:"
    docker-compose -f "$COMPOSE_FILE" ps
    log "🌐 Network status:"
    netstat -tlnp | grep :3000 || echo "Port 3000 not listening"
    exit 1
fi

# Show final status
log "📊 Final deployment status:"
echo "========================"
docker-compose -f "$COMPOSE_FILE" ps

# Show application URLs
log "🌐 Application URLs:"
echo "   Production: http://localhost:$PORT"
echo "   Health Check: http://localhost:$PORT/api/health"

success "🎉 Production deployment completed successfully!"
log "📝 Next steps:"
echo "   1. Verify all functionality is working correctly"
echo "   2. Check error logs and monitoring"
echo "   3. Update DNS if needed"
echo ""
log "💡 Useful commands:"
echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   - Restart: docker-compose -f $COMPOSE_FILE restart"
echo "   - Stop: docker-compose -f $COMPOSE_FILE down" 