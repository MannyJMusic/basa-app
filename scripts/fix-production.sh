#!/bin/bash

# Quick fix script for production deployment issues
# This script helps diagnose and fix common deployment problems

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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
APP_DIR="/opt/basa-app-prod"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

log "🔧 BASA Production Fix Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -d "$APP_DIR" ]; then
    error "Production directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Stop the restarting container
log "🛑 Stopping restarting containers..."
docker-compose -f "$COMPOSE_FILE" down

# Check environment file
log "🔍 Checking environment configuration..."
if [ ! -f "$ENV_FILE" ]; then
    error "Environment file $ENV_FILE not found!"
    echo ""
    echo "To create the environment file:"
    echo "1. Copy the example: cp .env.production.example .env.production"
    echo "2. Edit with your actual values"
    echo ""
    echo "Required variables:"
    echo "- DATABASE_URL"
    echo "- NEXTAUTH_URL"
    echo "- NEXTAUTH_SECRET"
    echo "- STRIPE_SECRET_KEY"
    echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "- MAILGUN_API_KEY"
    echo "- MAILGUN_DOMAIN"
    echo "- MAILGUN_FROM_EMAIL"
    echo ""
    echo "Generate NEXTAUTH_SECRET: openssl rand -base64 32"
    exit 1
fi

# Check for missing variables
log "🔍 Validating environment variables..."
missing_vars=()

# Check if variables are missing or have placeholder values
if ! grep -q "^DATABASE_URL=" "$ENV_FILE" || grep -q "^DATABASE_URL=\"\"" "$ENV_FILE"; then
    missing_vars+=("DATABASE_URL")
fi

if ! grep -q "^NEXTAUTH_SECRET=" "$ENV_FILE" || grep -q "^NEXTAUTH_SECRET=\"\"" "$ENV_FILE" || grep -q "your-production-nextauth-secret" "$ENV_FILE"; then
    missing_vars+=("NEXTAUTH_SECRET")
fi

if ! grep -q "^STRIPE_SECRET_KEY=" "$ENV_FILE" || grep -q "^STRIPE_SECRET_KEY=\"\"" "$ENV_FILE" || grep -q "your-stripe-secret-key" "$ENV_FILE"; then
    missing_vars+=("STRIPE_SECRET_KEY")
fi

if ! grep -q "^MAILGUN_API_KEY=" "$ENV_FILE" || grep -q "^MAILGUN_API_KEY=\"\"" "$ENV_FILE" || grep -q "your-mailgun-api-key" "$ENV_FILE"; then
    missing_vars+=("MAILGUN_API_KEY")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    error "Missing or invalid environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please update $ENV_FILE with valid values."
    echo "You can edit it with: nano $ENV_FILE"
    exit 1
fi

success "Environment variables look good!"

# Show container logs for debugging
log "📋 Recent container logs:"
docker-compose -f "$COMPOSE_FILE" logs --tail=20

# Ask user if they want to restart
echo ""
read -p "Do you want to restart the containers? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "🚀 Restarting containers..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    log "⏳ Waiting for containers to start..."
    sleep 10
    
    log "🔍 Checking container status..."
    docker-compose -f "$COMPOSE_FILE" ps
    
    log "🏥 Checking health..."
    if curl -s -f "http://localhost:3000/api/health" > /dev/null; then
        success "Application is healthy!"
    else
        warning "Health check failed. Check logs with: docker-compose -f $COMPOSE_FILE logs"
    fi
else
    log "Containers remain stopped. Start them manually with:"
    echo "docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d"
fi

echo ""
log "📚 Next steps:"
echo "1. Edit environment file: nano $ENV_FILE"
echo "2. Start containers: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d"
echo "3. Check logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "4. Check health: curl http://localhost:3000/api/health" 