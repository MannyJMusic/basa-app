#!/bin/bash

# Test Health Endpoint Script
# This script tests if the health endpoint is working

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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test local health endpoint
test_local_health() {
    log "Testing local health endpoint..."
    
    # Check if application is running locally
    if curl -s -f "http://localhost:3000/api/health" > /dev/null; then
        success "Local health check passed!"
        curl -s "http://localhost:3000/api/health" | jq . 2>/dev/null || curl -s "http://localhost:3000/api/health"
    else
        error "Local health check failed!"
        warning "Make sure the application is running on localhost:3000"
        return 1
    fi
}

# Test Docker health endpoint
test_docker_health() {
    log "Testing Docker health endpoint..."
    
    # Check if Docker containers are running
    if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        warning "Docker containers are not running. Starting them..."
        docker-compose -f docker-compose.dev.yml up -d
        sleep 30
    fi
    
    # Test health endpoint
    if curl -s -f "http://localhost:3001/api/health" > /dev/null; then
        success "Docker health check passed!"
        curl -s "http://localhost:3001/api/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/api/health"
    else
        error "Docker health check failed!"
        warning "Checking Docker logs..."
        docker-compose -f docker-compose.dev.yml logs --tail=20
        return 1
    fi
}

# Main execution
case "${1:-local}" in
    "local")
        test_local_health
        ;;
    "docker")
        test_docker_health
        ;;
    "both")
        test_local_health
        echo ""
        test_docker_health
        ;;
    *)
        echo "Usage: $0 {local|docker|both}"
        echo "  local  - Test local development server (port 3000)"
        echo "  docker - Test Docker development server (port 3001)"
        echo "  both   - Test both environments"
        exit 1
        ;;
esac 