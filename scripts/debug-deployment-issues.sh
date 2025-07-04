#!/bin/bash

# BASA Deployment Debug Script
# This script helps debug common deployment issues

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
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🔍 Starting BASA Deployment Debug..."

# Check current user and directory
log "👤 Current user: $(whoami)"
log "📍 Current directory: $(pwd)"

# Check if we're in a Git repository
if [ -d ".git" ]; then
    log "📁 Git repository detected"
    log "🔗 Git remote: $(git remote get-url origin 2>/dev/null || echo 'No remote configured')"
    log "🌿 Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    
    # Check Git ownership
    if git config --global --get-all safe.directory | grep -q "$(pwd)"; then
        success "Git safe directory configured for $(pwd)"
    else
        warning "Git safe directory not configured for $(pwd)"
        log "💡 Run: git config --global --add safe.directory $(pwd)"
    fi
else
    warning "Not in a Git repository"
fi

# Check Docker
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        success "Docker is running"
        log "🐳 Docker version: $(docker --version)"
    else
        error "Docker is installed but not running"
    fi
else
    error "Docker is not installed"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    success "Docker Compose is available"
    log "📦 Docker Compose version: $(docker-compose --version)"
else
    error "Docker Compose is not installed"
fi

# Check required files
log "📋 Checking required files..."

REQUIRED_FILES=(
    "docker-compose.dev.yml"
    "scripts/deploy-dev.sh"
    ".env.development"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file exists"
    else
        error "❌ $file missing"
    fi
done

# Check script permissions
log "🔐 Checking script permissions..."
if [ -x "scripts/deploy-dev.sh" ]; then
    success "✅ deploy-dev.sh is executable"
else
    warning "⚠️ deploy-dev.sh is not executable"
    log "💡 Run: chmod +x scripts/deploy-dev.sh"
fi

# Check disk space
log "💾 Checking disk space..."
df -h . | head -2

# Check Docker containers
log "🐳 Checking Docker containers..."
if command -v docker &> /dev/null && docker info > /dev/null 2>&1; then
    log "📊 Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    log "📊 All containers:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

# Check ports
log "🔌 Checking port usage..."
if command -v netstat &> /dev/null; then
    netstat -tlnp | grep -E ':(3000|3001|5432)' || log "No relevant ports in use"
elif command -v ss &> /dev/null; then
    ss -tlnp | grep -E ':(3000|3001|5432)' || log "No relevant ports in use"
else
    warning "Cannot check port usage (netstat/ss not available)"
fi

log "�� Debug complete!" 