#!/bin/bash

# Simple deployment status check script
# No external dependencies required

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

# Check if Docker containers are running
check_containers() {
    log "Checking Docker containers..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        return 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        return 1
    fi
    
    # Check if containers are running
    local running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(basa|app)" || true)
    
    if [ -z "$running_containers" ]; then
        error "No BASA containers are running"
        return 1
    else
        success "Containers are running:"
        echo "$running_containers"
    fi
}

# Check application health endpoints
check_health() {
    log "Checking application health..."
    
    local endpoints=(
        "http://localhost:3000/api/health"
        "http://localhost:3001/api/health"
    )
    
    local healthy=false
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$endpoint" > /dev/null 2>&1; then
            success "Health check passed: $endpoint"
            healthy=true
            break
        else
            warning "Health check failed: $endpoint"
        fi
    done
    
    if [ "$healthy" = false ]; then
        error "All health checks failed"
        return 1
    fi
}

# Check system resources
check_resources() {
    log "Checking system resources..."
    
    # Check disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        warning "Disk usage is high: ${disk_usage}%"
    else
        success "Disk usage: ${disk_usage}%"
    fi
    
    # Check memory usage
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        warning "Memory usage is high: ${mem_usage}%"
    else
        success "Memory usage: ${mem_usage}%"
    fi
    
    # Check if system restart is required
    if [ -f /var/run/reboot-required ]; then
        warning "System restart is required"
    else
        success "No system restart required"
    fi
}

# Main execution
main() {
    log "Starting deployment status check..."
    
    local exit_code=0
    
    check_containers || exit_code=1
    check_health || exit_code=1
    check_resources
    
    if [ $exit_code -eq 0 ]; then
        success "All checks passed - deployment is healthy!"
    else
        error "Some checks failed - deployment may have issues"
    fi
    
    exit $exit_code
}

# Run main function
main "$@" 