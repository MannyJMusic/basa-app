#!/bin/bash

# Quick Fix for Current Deployment Issues
# This script fixes the immediate issues preventing deployment

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
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🔧 Quick fixing current deployment issues..."

# Check if we're in the right directory
if [ ! -d "/opt/basa-app-dev" ]; then
    error "Please run this script from /opt/basa-app-dev"
fi

cd /opt/basa-app-dev

# 1. Create .env.development if missing
if [ ! -f ".env.development" ]; then
    log "📝 Creating .env.development file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.development
        success "Created .env.development from .env.example"
        warning "⚠️ Please configure .env.development with your environment variables"
    else
        error ".env.example not found. Cannot create .env.development"
    fi
else
    success "✅ .env.development already exists"
fi

# 2. Ensure we're on the dev branch
log "🌿 Checking branch..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" != "dev" ]; then
    warning "Currently on $CURRENT_BRANCH branch, switching to dev..."
    git checkout dev
    success "Switched to dev branch"
else
    success "✅ Already on dev branch"
fi

# 3. Clean up any local changes
log "🧹 Cleaning up local changes..."
if ! git diff-index --quiet HEAD --; then
    warning "Local changes detected, stashing them..."
    git stash push -m "Auto-stash before deployment $(date)"
    success "Changes stashed"
else
    success "✅ No local changes to clean up"
fi

# 4. Make sure scripts are executable
log "🔐 Making scripts executable..."
chmod +x scripts/*.sh
success "✅ Scripts made executable"

# 5. Run the deployment
log "🚀 Starting deployment..."
if [ "$(whoami)" = "root" ]; then
    log "👤 Switching to basa user for deployment..."
    su - basa -c "cd /opt/basa-app-dev && ./scripts/deploy-dev.sh"
else
    ./scripts/deploy-dev.sh
fi

success "🎉 Quick fix completed!" 