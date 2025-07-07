#!/bin/bash

# BASA Development Deployment Script
# This script deploys the development version to the Ubuntu server

set -e

# Configuration
APP_NAME="basa-app-dev"
APP_DIR="/opt/basa-app-dev"
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.development"
BRANCH="dev"
PORT="3001"

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

# Check if running as root and switch to appropriate user
if [ "$EUID" -eq 0 ]; then
    warning "Running as root, checking for appropriate user..."
    if id "basa" &>/dev/null; then
        # Get the full path to this script and the app directory
        SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
        exec su - basa -c "cd $APP_DIR && $SCRIPT_PATH $*"
    elif id "$SUDO_USER" &>/dev/null; then
        warning "Switching to $SUDO_USER user..."
        exec su - "$SUDO_USER" -c "$0 $*"
    else
        warning "Root user detected but no suitable user found. Continuing as root..."
        # Continue as root but be careful
    fi
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install it first."
fi

log "🚀 Starting BASA Development Deployment..."

# Navigate to app directory
if [ ! -d "$APP_DIR" ]; then
    log "📁 Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# Verify we're in the right directory
log "📍 Current directory: $(pwd)"
log "👤 Current user: $(whoami)"

# Clean up old backups (older than 1 week)
if [ -f "$ENV_FILE" ]; then
    log "🧹 Cleaning up old backups..."
    find . -name "${ENV_FILE}.backup.*" -type f -mtime +7 -delete 2>/dev/null || true
fi

# Pull latest changes
log "📥 Pulling latest changes from $BRANCH branch..."
if [ -d ".git" ] && git rev-parse --git-dir > /dev/null 2>&1; then
    # Ensure Git ownership is properly configured
    git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
    
    # Handle any local changes or divergent branches
    log "🔄 Fetching latest changes..."
    git fetch origin
    
    # Check if we have local changes that need to be handled
    if ! git diff-index --quiet HEAD --; then
        log "⚠️ Local changes detected, stashing them..."
        git stash
    fi
    
    # Reset to match remote branch exactly
    log "🔄 Resetting to match remote branch..."
    git reset --hard origin/$BRANCH
else
    log "📥 Git repository not found or corrupted, cloning fresh..."
    # Save important files
    if [ -f "$ENV_FILE" ]; then
        log "💾 Preserving environment file..."
        cp "$ENV_FILE" /tmp/env_backup
    fi
    
    # Clone to temporary location
    cd /tmp
    git clone -b $BRANCH https://github.com/businessassociationsa/basa-app.git temp_repo
    
    # Move back and replace everything except important files
    cd "$APP_DIR"
    rm -rf .git 2>/dev/null || true
    cp -r /tmp/temp_repo/* .
    cp -r /tmp/temp_repo/.git .
    
    # Clean up temp directory
    rm -rf /tmp/temp_repo
    
    # Restore important files
    if [ -f /tmp/env_backup ]; then
        log "💾 Restoring environment file..."
        cp /tmp/env_backup "$ENV_FILE"
        rm /tmp/env_backup
    fi
fi



# Create environment file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    log "⚙️ Creating environment file..."
    if [ -f ".env.development.example" ]; then
        cp .env.development.example "$ENV_FILE"
        warning "Please edit $ENV_FILE with your development environment variables"
    else
        cp .env.example "$ENV_FILE"
        warning "Please edit $ENV_FILE with your development environment variables"
    fi
fi

# Verify required files exist
log "🔍 Verifying required files..."
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Docker Compose file $COMPOSE_FILE not found!"
fi

if [ ! -f "scripts/deploy-dev.sh" ]; then
    error "Deploy script scripts/deploy-dev.sh not found!"
fi

log "✅ All required files found"

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans

# Clean up old images (optional)
log "🧹 Cleaning up old Docker images..."
docker image prune -f

# Build and start containers
log "🔨 Building and starting containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# Wait for containers to start
log "⏳ Waiting for containers to start..."
sleep 10

# Check application health with progressive intervals
log "🏥 Checking application health..."
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if timeout 5 curl -s -f "http://localhost:$PORT/api/health" > /dev/null; then
        success "Application is healthy!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        # Show progress every 5 attempts
        if [ $((RETRY_COUNT % 5)) -eq 0 ]; then
            log "📊 Progress: $RETRY_COUNT/$MAX_RETRIES attempts completed"
            log "📋 Container status:"
            docker-compose -f "$COMPOSE_FILE" ps
        fi
        
        # Progressive intervals: 3 seconds for first 10 attempts, then 5 seconds
        if [ $RETRY_COUNT -lt 10 ]; then
            warning "Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 3 seconds..."
            sleep 3
        else
            warning "Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Application health check failed after $MAX_RETRIES attempts"
    log "📋 Container status:"
    docker-compose -f "$COMPOSE_FILE" ps
    log "📋 Container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    exit 1
fi

# Show container status
log "📊 Container status:"
docker-compose -f "$COMPOSE_FILE" ps

# Show application URLs
log "🌐 Application URLs:"
echo "   Development: http://localhost:$PORT"
echo "   Health Check: http://localhost:$PORT/api/health"

success "🎉 Development deployment completed successfully!"
log "📝 Next steps:"
echo "   1. Configure your environment variables in $ENV_FILE"
echo "   2. Set up your domain/subdomain to point to this server"
echo "   3. Configure Nginx reverse proxy if needed" 