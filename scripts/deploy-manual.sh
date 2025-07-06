#!/bin/bash

# Manual deployment script for BASA app
# This script handles Git permissions without requiring sudo

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
BRANCH="main"
REPO_URL="https://github.com/MannyJMusic/basa-app.git"

log "🚀 Starting manual deployment..."

# Navigate to app directory
cd "$APP_DIR" || {
    error "Cannot navigate to $APP_DIR"
    exit 1
}

log "📁 Current directory: $(pwd)"
log "👤 Current user: $(whoami)"

# Check if .git directory exists
if [ -d ".git" ]; then
    log "🔧 Fixing Git repository permissions..."
    
    # Try to fix Git ownership without sudo first
    if [ -w ".git" ]; then
        log "📝 Git directory is writable, proceeding with fixes..."
        # Ensure proper Git configuration
        git config --global --add safe.directory "$APP_DIR"
        
        # Try to fix permissions without sudo
        chmod -R 755 .git 2>/dev/null || warning "Could not change .git permissions (may need sudo)"
        chmod -R 755 . 2>/dev/null || warning "Could not change file permissions (may need sudo)"
        
        log "📥 Pulling latest changes from $BRANCH branch..."
        git fetch origin
        git reset --hard origin/$BRANCH
        success "Git repository updated successfully"
    else
        warning "Git directory not writable, attempting to fix with sudo..."
        # Try sudo with error handling
        if sudo -n chown -R $USER:$USER .git 2>/dev/null; then
            sudo chmod -R 755 .git
            git config --global --add safe.directory "$APP_DIR"
            log "📥 Pulling latest changes from $BRANCH branch..."
            git fetch origin
            git reset --hard origin/$BRANCH
            success "Git repository updated successfully with sudo"
        else
            error "Cannot fix Git permissions - sudo access required"
            log "📝 Attempting to continue with current permissions..."
            git config --global --add safe.directory "$APP_DIR"
            git fetch origin
            git reset --hard origin/$BRANCH
            success "Git repository updated (with permission warnings)"
        fi
    fi
else
    log "📥 Cloning repository..."
    git clone -b $BRANCH "$REPO_URL" .
    
    # Try to set proper ownership after cloning (without sudo if possible)
    if [ -w "." ]; then
        chmod -R 755 . 2>/dev/null || warning "Could not set file permissions"
    else
        sudo -n chown -R $USER:$USER . 2>/dev/null && sudo chmod -R 755 . || warning "Could not set ownership/permissions"
    fi
    success "Repository cloned successfully"
fi

# Make scripts executable
log "🔧 Making scripts executable..."
chmod +x scripts/*.sh 2>/dev/null || warning "Could not make all scripts executable"

# Check if deploy script exists
if [ ! -f "scripts/deploy-prod.sh" ]; then
    error "Deploy script not found: scripts/deploy-prod.sh"
    exit 1
fi

# Run deployment check if available
if [ -f "scripts/check-deployment.sh" ]; then
    log "🔍 Running deployment check..."
    if ./scripts/check-deployment.sh; then
        success "Deployment check passed"
    else
        warning "Deployment check failed, but continuing with deployment..."
    fi
fi

# Run the actual deployment
log "🚀 Running production deployment..."
./scripts/deploy-prod.sh

success "Manual deployment completed!" 