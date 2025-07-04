#!/bin/bash

# BASA Environment File Creation Script
# This script creates environment files for deployment

set -e

# Configuration
ENV_TYPE="${1:-development}"  # development, production, or test
ENV_FILE=".env.${ENV_TYPE}"

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

# Function to validate environment file
validate_env_file() {
    local env_file="$1"
    
    if [ ! -f "$env_file" ]; then
        error "Environment file $env_file not found!"
    fi
    
    # Check for required variables
    local required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=\"\"" "$env_file" || grep -q "^${var}=\"your-" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        warning "Missing or unconfigured required variables: ${missing_vars[*]}"
        warning "Please update $env_file with proper values"
        return 1
    fi
    
    success "Environment file $env_file is valid"
    return 0
}

# Function to create environment file from example
create_env_from_example() {
    local env_file="$1"
    local env_type="$2"
    
    if [ -f ".env.example" ]; then
        log "Creating $env_file from .env.example..."
        cp .env.example "$env_file"
        
        # Update environment-specific values
        case "$env_type" in
            "production")
                # Update for production
                sed -i 's/NODE_ENV="development"/NODE_ENV="production"/' "$env_file"
                sed -i 's/NEXTAUTH_URL="http:\/\/localhost:3000"/NEXTAUTH_URL="https:\/\/yourdomain.com"/' "$env_file"
                sed -i 's/NEXT_PUBLIC_APP_URL="http:\/\/localhost:3000"/NEXT_PUBLIC_APP_URL="https:\/\/yourdomain.com"/' "$env_file"
                ;;
            "development")
                # Update for development
                sed -i 's/NODE_ENV="production"/NODE_ENV="development"/' "$env_file"
                sed -i 's/NEXTAUTH_URL="https:\/\/yourdomain.com"/NEXTAUTH_URL="http:\/\/localhost:3000"/' "$env_file"
                sed -i 's/NEXT_PUBLIC_APP_URL="https:\/\/yourdomain.com"/NEXT_PUBLIC_APP_URL="http:\/\/localhost:3000"/' "$env_file"
                ;;
            "test")
                # Update for testing
                sed -i 's/NODE_ENV="development"/NODE_ENV="test"/' "$env_file"
                sed -i 's/NEXTAUTH_URL="http:\/\/localhost:3000"/NEXTAUTH_URL="http:\/\/localhost:3000"/' "$env_file"
                ;;
        esac
        
        success "Created $env_file from .env.example"
        warning "Please update $env_file with your actual credentials"
        return 0
    else
        error ".env.example not found! Cannot create $env_file"
        return 1
    fi
}

# Main execution
log "🔧 Creating environment file for $ENV_TYPE environment..."

# Check if environment file already exists
if [ -f "$ENV_FILE" ]; then
    log "Environment file $ENV_FILE already exists"
    if validate_env_file "$ENV_FILE"; then
        success "Environment file $ENV_FILE is ready for deployment"
        exit 0
    else
        warning "Environment file $ENV_FILE exists but has issues"
        read -p "Do you want to recreate it from .env.example? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_env_from_example "$ENV_FILE" "$ENV_TYPE"
        else
            warning "Keeping existing $ENV_FILE - please fix the issues manually"
            exit 1
        fi
    fi
else
    # Create new environment file
    create_env_from_example "$ENV_FILE" "$ENV_TYPE"
fi

# Final validation
if validate_env_file "$ENV_FILE"; then
    success "Environment file $ENV_FILE is ready for deployment"
else
    warning "Environment file $ENV_FILE created but needs configuration"
    echo "Please update the following in $ENV_FILE:"
    echo "  - DATABASE_URL"
    echo "  - NEXTAUTH_SECRET"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - MAILGUN_API_KEY"
    echo "  - Other service-specific credentials"
    exit 1
fi 