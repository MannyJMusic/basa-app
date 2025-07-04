#!/bin/bash

# Fix Divergent Branches Script
# This script resolves Git divergent branches issues on the server

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

log "🔧 Fixing divergent branches issue..."

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    error "Not in a Git repository. Please run this script from the project directory."
fi

# Show current status
log "📊 Current Git status:"
git status --short

# Show branch information
log "🌿 Current branch: $(git branch --show-current)"
log "🔗 Remote tracking: $(git branch -vv | grep '*' | awk '{print $4}')"

# Fix Git ownership if needed
log "🔐 Configuring Git safe directory..."
git config --global --add safe.directory "$(pwd)" 2>/dev/null || true

# Fetch latest changes
log "📥 Fetching latest changes from remote..."
git fetch origin

# Check for divergent branches
if git status --porcelain | grep -q "##.*ahead.*behind\|##.*diverged"; then
    warning "Divergent branches detected!"
    
    # Show the divergence
    log "📊 Branch divergence:"
    git status --porcelain | grep "##"
    
    # Ask for confirmation (if running interactively)
    if [ -t 0 ]; then
        read -p "Do you want to reset to match the remote branch? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Operation cancelled."
            exit 0
        fi
    fi
    
    # Stash any local changes
    if ! git diff-index --quiet HEAD --; then
        log "💾 Stashing local changes..."
        git stash push -m "Auto-stash before reset $(date)"
    fi
    
    # Reset to match remote branch
    CURRENT_BRANCH=$(git branch --show-current)
    log "🔄 Resetting to match origin/$CURRENT_BRANCH..."
    git reset --hard "origin/$CURRENT_BRANCH"
    
    success "Branch reset completed!"
else
    success "No divergent branches detected."
fi

# Verify the fix
log "✅ Verifying fix..."
git status --short

if [ -z "$(git status --porcelain)" ]; then
    success "Repository is now clean and up to date!"
else
    warning "Repository still has some changes:"
    git status --short
fi

log "🎯 Divergent branches fix completed!" 