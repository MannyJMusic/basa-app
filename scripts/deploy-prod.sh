#!/bin/bash

# BASA Production Deployment Script
# This script deploys the production version to the Ubuntu server with rollback capabilities

set -e

# Configuration
APP_NAME="basa-app-prod"
APP_DIR="/opt/basa-app-prod"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BRANCH="main"
PORT="3000"
BACKUP_DIR="/opt/basa-backups"

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

# Function to create backup
create_backup() {
    local backup_name="backup-$(date +%Y%m%d_%H%M%S)"
    log "💾 Creating backup: $backup_name"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current application state
    if [ -d "$APP_DIR" ]; then
        tar -czf "$BACKUP_DIR/$backup_name.tar.gz" -C "$APP_DIR" .
        log "✅ Backup created: $BACKUP_DIR/$backup_name.tar.gz"
    fi
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t *.tar.gz | tail -n +6 | xargs -r rm
}

# Function to rollback
rollback() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "$BACKUP_DIR"/*.tar.gz | head -n 1)
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "No backup file found for rollback"
    fi
    
    log "🔄 Rolling back to: $(basename "$backup_file")"
    
    # Stop current containers
    cd "$APP_DIR"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    
    # Restore from backup
    rm -rf "$APP_DIR"/*
    tar -xzf "$backup_file" -C "$APP_DIR"
    
    # Restart containers
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    success "Rollback completed successfully"
}

# Check if running as root and switch to appropriate user
if [ "$EUID" -eq 0 ]; then
    warning "Running as root, checking for appropriate user..."
    if id "basa" &>/dev/null; then
        warning "Switching to basa user..."
        # Pass the full path to the script when switching users
        exec su - basa -c "cd $APP_DIR && $0 $*"
    elif id "$SUDO_USER" &>/dev/null; then
        warning "Switching to $SUDO_USER user..."
        exec su - "$SUDO_USER" -c "cd $APP_DIR && $0 $*"
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

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        log "🚀 Starting BASA Production Deployment..."
        ;;
    "rollback")
        log "🔄 Starting Production Rollback..."
        rollback "$2"
        exit 0
        ;;
    "backup")
        log "💾 Creating Production Backup..."
        create_backup
        exit 0
        ;;
    *)
        echo "Usage: $0 {deploy|rollback [backup_file]|backup}"
        exit 1
        ;;
esac

# Create backup before deployment
create_backup

# Navigate to app directory
if [ ! -d "$APP_DIR" ]; then
    log "📁 Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# Fix Git ownership and permissions
log "🔧 Fixing Git repository permissions..."
if [ -d ".git" ]; then
    # Fix Git ownership
    sudo chown -R $USER:$USER .git
    sudo chmod -R 755 .git
    
    # Ensure proper Git configuration
    git config --global --add safe.directory "$APP_DIR"
    
    log "📥 Pulling latest changes from $BRANCH branch..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    log "📥 Cloning repository..."
    git clone -b $BRANCH https://github.com/MannyJMusic/basa-app.git .
    
    # Set proper ownership after cloning
    sudo chown -R $USER:$USER .
    sudo chmod -R 755 .
fi

# Backup current environment file if it exists
if [ -f "$ENV_FILE" ]; then
    log "💾 Backing up current environment file..."
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    error "Production environment file $ENV_FILE not found!"
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
    echo ""
    echo "You can generate a secure NEXTAUTH_SECRET with:"
    echo "openssl rand -base64 32"
    echo ""
    exit 1
fi

# Validate that required environment variables are set
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

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans

# Clean up old images (optional)
log "🧹 Cleaning up old Docker images..."
docker image prune -f

# Build and start containers
log "🔨 Building and starting containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# Wait for containers to be healthy
log "⏳ Waiting for containers to be healthy..."
sleep 30

# Check application health
log "🏥 Checking application health..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f "http://localhost:$PORT/api/health" > /dev/null; then
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
    log "🔄 Initiating automatic rollback..."
    rollback
    exit 1
fi

# Show container status
log "📊 Container status:"
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