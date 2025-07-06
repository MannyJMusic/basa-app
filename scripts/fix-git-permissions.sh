#!/bin/bash

# Fix Git Permissions Script
# This script fixes common Git permission issues on the production server

set -e

# Configuration
APP_DIR="/opt/basa-app-prod"
CURRENT_USER=$(whoami)

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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log "🔧 Fixing Git permissions for BASA production deployment..."

# Check if we're in the right directory
if [ ! -d "$APP_DIR" ]; then
    error "Application directory $APP_DIR not found!"
fi

cd "$APP_DIR"

# Check if .git directory exists
if [ ! -d ".git" ]; then
    error "Git repository not found in $APP_DIR"
fi

log "📁 Current directory: $(pwd)"
log "👤 Current user: $CURRENT_USER"

# Fix Git ownership
log "🔧 Fixing Git repository ownership..."
if [ -w ".git" ]; then
    log "📝 Git directory is writable, proceeding without sudo..."
    # Try without sudo first
    chmod -R 755 .git 2>/dev/null || log "⚠️  Could not change .git permissions"
    chmod -R 755 . 2>/dev/null || log "⚠️  Could not change file permissions"
else
    log "⚠️  Git directory not writable, attempting with sudo..."
    # Try sudo with error handling
    if sudo -n chown -R $CURRENT_USER:$CURRENT_USER .git 2>/dev/null; then
        sudo chmod -R 755 .git
        sudo chown -R $CURRENT_USER:$CURRENT_USER .
        sudo chmod -R 755 .
        success "✅ Git permissions fixed with sudo"
    else
        warning "⚠️  Cannot use sudo - attempting alternative fixes..."
        # Try alternative approaches
        git config --global --add safe.directory "$APP_DIR"
        log "📝 Set Git safe directory configuration"
    fi
fi

# Fix Git permissions
log "🔧 Fixing Git repository permissions..."
# Try without sudo first
if [ -w ".git" ]; then
    chmod -R 755 .git 2>/dev/null || log "⚠️  Could not change .git permissions"
    chmod -R 755 . 2>/dev/null || log "⚠️  Could not change file permissions"
else
    # Try with sudo if available
    sudo -n chmod -R 755 .git 2>/dev/null || log "⚠️  Could not change .git permissions with sudo"
    sudo -n chmod -R 755 . 2>/dev/null || log "⚠️  Could not change file permissions with sudo"
fi

# Configure Git safe directory
log "🔧 Configuring Git safe directory..."
git config --global --add safe.directory "$APP_DIR"

# Test Git operations
log "🧪 Testing Git operations..."
if git status > /dev/null 2>&1; then
    success "Git operations working correctly!"
else
    error "Git operations still failing after permission fixes"
fi

# Show Git configuration
log "📋 Git configuration:"
git config --list | grep -E "(user\.|safe\.directory)" || echo "No user or safe directory config found"

success "✅ Git permissions fixed successfully!"
log "📝 You can now run the deployment script again." 