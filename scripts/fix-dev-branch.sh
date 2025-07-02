#!/bin/bash

# Fix Dev Branch Script
# This script ensures the dev environment is using the dev branch

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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log "🔧 Fixing dev environment branch..."

# Navigate to dev app directory
cd /opt/basa-app-dev

# Check current branch
log "📋 Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
log "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "dev" ]; then
    success "Already on dev branch!"
else
    warning "Currently on $CURRENT_BRANCH branch, switching to dev..."
    
    # Stop containers first
    log "🛑 Stopping containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    # Fetch all branches
    log "📥 Fetching all branches..."
    git fetch origin
    
    # Check if dev branch exists
    if git show-ref --verify --quiet refs/remotes/origin/dev; then
        # Switch to dev branch
        log "🔄 Switching to dev branch..."
        git checkout dev
        git pull origin dev
        
        success "Successfully switched to dev branch!"
    else
        error "Dev branch not found on remote!"
        log "Available branches:"
        git branch -r
        exit 1
    fi
    
    # Restart containers with new code
    log "🚀 Restarting containers with dev branch code..."
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
fi

# Show final status
log "📊 Final status:"
echo "Branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo "Container status:"
docker-compose -f docker-compose.dev.yml ps

success "Dev environment branch fix completed!" 