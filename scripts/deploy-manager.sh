#!/bin/bash

# BASA Deployment Manager
# Comprehensive deployment and debugging script that consolidates all deployment functionality

set -e

# Configuration
APP_NAME_DEV="basa-app-dev"
APP_NAME_PROD="basa-app-prod"
APP_DIR_DEV="/opt/basa-app-dev"
APP_DIR_PROD="/opt/basa-app-prod"
COMPOSE_FILE_DEV="docker-compose.dev.yml"
COMPOSE_FILE_PROD="docker-compose.prod.yml"
ENV_FILE_DEV=".env.local"
ENV_FILE_PROD=".env.production"
BRANCH_DEV="dev"
BRANCH_PROD="main"
PORT_DEV="3001"
PORT_PROD="3000"
BACKUP_DIR="/opt/basa-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
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

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Function to create backup
create_backup() {
    local app_dir="$1"
    local backup_name="backup-$(date +%Y%m%d_%H%M%S)"
    
    log "💾 Creating backup: $backup_name"
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "$app_dir" ]; then
        tar -czf "$BACKUP_DIR/$backup_name.tar.gz" -C "$app_dir" .
        success "Backup created: $BACKUP_DIR/$backup_name.tar.gz"
    else
        warning "App directory not found, skipping backup"
    fi
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t *.tar.gz | tail -n +6 | xargs -r rm
}

# Function to rollback
rollback() {
    local app_dir="$1"
    local backup_file="$2"
    
    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "$BACKUP_DIR"/*.tar.gz | head -n 1)
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "No backup file found for rollback"
        return 1
    fi
    
    log "🔄 Rolling back to: $(basename "$backup_file")"
    
    # Stop current containers
    cd "$app_dir"
    if [ -f "$COMPOSE_FILE_DEV" ]; then
        docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" down
    elif [ -f "$COMPOSE_FILE_PROD" ]; then
        docker-compose -f "$COMPOSE_FILE_PROD" --env-file "$ENV_FILE_PROD" down
    fi
    
    # Restore from backup
    rm -rf "$app_dir"/*
    tar -xzf "$backup_file" -C "$app_dir"
    
    # Restart containers
    if [ -f "$COMPOSE_FILE_DEV" ]; then
        docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" up -d
    elif [ -f "$COMPOSE_FILE_PROD" ]; then
        docker-compose -f "$COMPOSE_FILE_PROD" --env-file "$ENV_FILE_PROD" up -d
    fi
    
    success "Rollback completed successfully"
}

# Function to check system requirements
check_requirements() {
    log "🔍 Checking system requirements..."
    
    # Check if running as root and switch to appropriate user
    if [ "$EUID" -eq 0 ]; then
        warning "Running as root, switching to basa user..."
        if id "basa" &>/dev/null; then
            exec su - basa -c "$0 $*"
        else
            error "Root user detected but 'basa' user not found. Please run as non-root user."
            exit 1
        fi
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install it first."
        exit 1
    fi
    
    success "System requirements met"
}

# Function to debug deployment issues
debug_deployment() {
    local app_dir="$1"
    local compose_file="$2"
    local env_file="$3"
    local port="$4"
    
    log "🔍 Debugging deployment issues..."
    
    # Check current user and directory
    info "Current user: $(whoami)"
    info "Current directory: $(pwd)"
    
    # Check if we're in a Git repository
    if [ -d ".git" ]; then
        info "Git repository detected"
        info "Git remote: $(git remote get-url origin 2>/dev/null || echo 'No remote configured')"
        info "Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
        
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
    if docker info > /dev/null 2>&1; then
        success "Docker is running"
        info "Docker version: $(docker --version)"
    else
        error "Docker is not running"
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose is available"
        info "Docker Compose version: $(docker-compose --version)"
    else
        error "Docker Compose is not installed"
    fi
    
    # Check required files
    log "📋 Checking required files..."
    
    REQUIRED_FILES=("$compose_file" "$env_file" "package.json")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            success "✅ $file exists"
        else
            error "❌ $file missing"
        fi
    done
    
    # Check script permissions
    log "🔐 Checking script permissions..."
    if [ -x "scripts/deploy-dev.sh" ] || [ -x "scripts/deploy-prod.sh" ]; then
        success "✅ Deploy scripts are executable"
    else
        warning "⚠️ Deploy scripts are not executable"
        log "💡 Run: chmod +x scripts/deploy-*.sh"
    fi
    
    # Check disk space
    log "💾 Checking disk space..."
    df -h . | head -2
    
    # Check Docker containers
    log "🐳 Checking Docker containers..."
    if [ -f "$compose_file" ]; then
        log "📊 Running containers:"
        docker-compose -f "$compose_file" --env-file "$env_file" ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        log "📊 All containers:"
        docker-compose -f "$compose_file" --env-file "$env_file" ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    fi
    
    # Check ports
    log "🔌 Checking port usage..."
    if command -v netstat &> /dev/null; then
        netstat -tlnp | grep -E ":($port|5432)" || log "No relevant ports in use"
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep -E ":($port|5432)" || log "No relevant ports in use"
    else
        warning "Cannot check port usage (netstat/ss not available)"
    fi
    
    # Check application health
    log "🏥 Testing application health..."
    if curl -s -f "http://localhost:$port/api/health" > /dev/null; then
        success "Health endpoint is responding"
        curl -s "http://localhost:$port/api/health" | jq . 2>/dev/null || curl -s "http://localhost:$port/api/health"
    else
        error "Health endpoint is not responding"
    fi
    
    # Check container logs
    log "📋 Recent container logs:"
    if [ -f "$compose_file" ]; then
        docker-compose -f "$compose_file" --env-file "$env_file" logs --tail=20
    fi
    
    # Check environment variables
    log "⚙️ Checking environment variables..."
    if [ -f "$env_file" ]; then
        success "Environment file exists"
        echo "DATABASE_URL: $(grep DATABASE_URL "$env_file" | cut -d'=' -f2 | cut -d'"' -f2)"
        echo "NEXTAUTH_URL: $(grep NEXTAUTH_URL "$env_file" | cut -d'=' -f2 | cut -d'"' -f2)"
    else
        error "Environment file $env_file not found"
    fi
    
    # Check database connection
    log "🗄️ Testing database connection..."
    if docker exec basa-postgres-dev pg_isready -U basa_user -d basa_dev > /dev/null 2>&1; then
        success "Database is accepting connections"
    else
        error "Database is not accepting connections"
    fi
    
    # Check disk space
    log "💾 Checking disk space..."
    df -h | grep -E "(Filesystem|/opt)"
    
    # Check memory usage
    log "🧠 Checking memory usage..."
    free -h
    
    # Check Docker resources
    log "🐳 Checking Docker resources..."
    docker system df
    
    log "🔍 Debug complete!"
}

# Function to fix dev branch
fix_dev_branch() {
    log "🔧 Fixing dev environment branch..."
    
    # Navigate to dev app directory
    cd "$APP_DIR_DEV"
    
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
        docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" down --remove-orphans
        
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
        docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" up -d --build
        
        # Quick health check
        log "🏥 Quick health check..."
        sleep 15
        if curl -s -f "http://localhost:$PORT_DEV/api/health" > /dev/null; then
            success "Application is healthy!"
        else
            warning "Health check failed, but containers are running"
            docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" ps
        fi
    fi
    
    # Show final status
    log "📊 Final status:"
    echo "Branch: $(git branch --show-current)"
    echo "Latest commit: $(git log -1 --oneline)"
    echo "Container status:"
    docker-compose -f "$COMPOSE_FILE_DEV" --env-file "$ENV_FILE_DEV" ps
    
    success "Dev environment branch fix completed!"
}

# Function to quick fix deployment
quick_fix_deployment() {
    local app_dir="$1"
    local compose_file="$2"
    local env_file="$3"
    local port="$4"
    
    log "🔧 Quick fixing deployment..."
    
    # Navigate to app directory
    cd "$app_dir"
    
    # Stop all containers
    log "🛑 Stopping containers..."
    docker-compose -f "$compose_file" --env-file "$env_file" down --remove-orphans
    
    # Clean up Docker
    log "🧹 Cleaning up Docker..."
    docker system prune -f
    
    # Pull latest changes
    log "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/dev
    
    # Verify Docker Compose file
    log "🔍 Verifying Docker Compose configuration..."
    if docker-compose -f "$compose_file" config > /dev/null 2>&1; then
        success "Docker Compose configuration is valid"
    else
        warning "Docker Compose configuration has errors, attempting to fix..."
        # Try to fix common issues
        sed -i '/^[[:space:]]*env_file:[[:space:]]*$/d' "$compose_file"
        sed -i '/^[[:space:]]*- \.env\.local[[:space:]]*$/d' "$compose_file"
        echo "    env_file:" >> "$compose_file"
        echo "      - $env_file" >> "$compose_file"
    fi
    
    # Start containers
    log "🚀 Starting containers..."
    docker-compose -f "$compose_file" --env-file "$env_file" up -d --build
    
    # Quick health check
    log "🏥 Quick health check..."
    sleep 15
    if curl -s -f "http://localhost:$port/api/health" > /dev/null; then
        success "Application is healthy!"
    else
        warning "Health check failed, but containers are running"
        docker-compose -f "$compose_file" --env-file "$env_file" ps
    fi
    
    success "Quick fix completed!"
}

# Function to start Docker containers
start_docker() {
    local app_dir="$1"
    local compose_file="$2"
    local env_file="$3"
    
    log "🐳 Starting Docker containers..."
    
    cd "$app_dir"
    
    # Check if containers are already running
    if docker-compose -f "$compose_file" --env-file "$env_file" ps | grep -q "Up"; then
        success "Containers are already running"
        docker-compose -f "$compose_file" --env-file "$env_file" ps
    else
        # Start containers
        docker-compose -f "$compose_file" --env-file "$env_file" up -d
        
        # Wait for containers to start
        log "⏳ Waiting for containers to start..."
        sleep 10
        
        # Check status
        docker-compose -f "$compose_file" --env-file "$env_file" ps
    fi
}

# Main menu
show_main_menu() {
    echo -e "\n${CYAN}🚀 BASA Deployment Manager${NC}\n"
    echo "Available operations:"
    echo "1. Deploy Development Environment"
    echo "2. Deploy Production Environment"
    echo "3. Debug Development Environment"
    echo "4. Debug Production Environment"
    echo "5. Fix Dev Branch"
    echo "6. Quick Fix Development"
    echo "7. Quick Fix Production"
    echo "8. Start Docker Containers (Dev)"
    echo "9. Start Docker Containers (Prod)"
    echo "10. Create Backup"
    echo "11. Rollback"
    echo "0. Exit"
    echo ""
}

# Main execution
main() {
    check_requirements
    
    while true; do
        show_main_menu
        
        read -p "Select an option (0-11): " choice
        
        case $choice in
            0)
                echo "👋 Goodbye!"
                exit 0
                ;;
            1)
                log "🚀 Deploying Development Environment..."
                bash ./scripts/deploy-dev.sh
                ;;
            2)
                log "🚀 Deploying Production Environment..."
                bash ./scripts/deploy-prod.sh
                ;;
            3)
                log "🔍 Debugging Development Environment..."
                debug_deployment "$APP_DIR_DEV" "$COMPOSE_FILE_DEV" "$ENV_FILE_DEV" "$PORT_DEV"
                ;;
            4)
                log "🔍 Debugging Production Environment..."
                debug_deployment "$APP_DIR_PROD" "$COMPOSE_FILE_PROD" "$ENV_FILE_PROD" "$PORT_PROD"
                ;;
            5)
                fix_dev_branch
                ;;
            6)
                log "🔧 Quick Fixing Development Environment..."
                quick_fix_deployment "$APP_DIR_DEV" "$COMPOSE_FILE_DEV" "$ENV_FILE_DEV" "$PORT_DEV"
                ;;
            7)
                log "🔧 Quick Fixing Production Environment..."
                quick_fix_deployment "$APP_DIR_PROD" "$COMPOSE_FILE_PROD" "$ENV_FILE_PROD" "$PORT_PROD"
                ;;
            8)
                start_docker "$APP_DIR_DEV" "$COMPOSE_FILE_DEV" "$ENV_FILE_DEV"
                ;;
            9)
                start_docker "$APP_DIR_PROD" "$COMPOSE_FILE_PROD" "$ENV_FILE_PROD"
                ;;
            10)
                read -p "Create backup for which environment? (dev/prod): " env
                if [ "$env" = "dev" ]; then
                    create_backup "$APP_DIR_DEV"
                elif [ "$env" = "prod" ]; then
                    create_backup "$APP_DIR_PROD"
                else
                    error "Invalid environment. Use 'dev' or 'prod'"
                fi
                ;;
            11)
                read -p "Rollback which environment? (dev/prod): " env
                if [ "$env" = "dev" ]; then
                    rollback "$APP_DIR_DEV"
                elif [ "$env" = "prod" ]; then
                    rollback "$APP_DIR_PROD"
                else
                    error "Invalid environment. Use 'dev' or 'prod'"
                fi
                ;;
            *)
                error "Invalid choice. Please select a number between 0 and 11."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "
BASA Deployment Manager

This script consolidates all deployment and debugging functionality:
- Development and production deployments
- Deployment debugging and troubleshooting
- Branch management and fixes
- Docker container management
- Backup and rollback operations

Usage:
  bash scripts/deploy-manager.sh

Prerequisites:
1. Docker and Docker Compose installed
2. Git repository configured
3. Environment files set up
4. Appropriate user permissions

Features:
- Interactive menu system
- Comprehensive debugging tools
- Automatic backup and rollback
- Health checks and monitoring
- Error handling and logging
"
    exit 0
fi

# Start the application
main "$@" 