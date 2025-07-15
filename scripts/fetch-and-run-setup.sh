#!/bin/bash

# BASA Server Setup Fetcher
# This script downloads and runs the BASA server setup script from GitHub
# Run this on a fresh Ubuntu server to set up the BASA application infrastructure

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root (use sudo)"
fi

log "🚀 BASA Server Setup Fetcher"
log "This script will download and run the BASA server setup from GitHub"

# Configuration
GITHUB_REPO="https://github.com/MannyJMusic/basa-app.git"
SETUP_SCRIPT="scripts/setup-server.sh"
TEMP_DIR="/tmp/basa-setup-fetch"

# Create temporary directory
log "📁 Creating temporary directory..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download setup script from GitHub
log "📥 Downloading setup script from GitHub..."
if command -v curl &> /dev/null; then
    # Try to download the specific file directly
    if curl -f -L "https://raw.githubusercontent.com/MannyJMusic/basa-app/main/scripts/setup-server.sh" -o setup-server.sh; then
        success "Setup script downloaded successfully"
    else
        warning "Direct download failed, cloning repository..."
        git clone "$GITHUB_REPO" .
        if [ ! -f "$SETUP_SCRIPT" ]; then
            error "Setup script not found in repository"
        fi
        cp "$SETUP_SCRIPT" setup-server.sh
    fi
elif command -v wget &> /dev/null; then
    # Try to download the specific file directly
    if wget -q "https://raw.githubusercontent.com/MannyJMusic/basa-app/main/scripts/setup-server.sh" -O setup-server.sh; then
        success "Setup script downloaded successfully"
    else
        warning "Direct download failed, cloning repository..."
        git clone "$GITHUB_REPO" .
        if [ ! -f "$SETUP_SCRIPT" ]; then
            error "Setup script not found in repository"
        fi
        cp "$SETUP_SCRIPT" setup-server.sh
    fi
else
    error "Neither curl nor wget is available. Please install one of them first."
fi

# Make script executable
chmod +x setup-server.sh

# Run the setup script
log "🚀 Running BASA server setup..."
./setup-server.sh

# Clean up
log "🧹 Cleaning up temporary files..."
cd /
rm -rf "$TEMP_DIR"

success "🎉 BASA server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Edit /opt/basa-app-prod/.env.domains with your actual domain names"
echo "3. Edit /opt/basa-app-prod/.env.production with your actual service credentials"
echo "4. Edit /opt/basa-app-dev/.env.development with your actual service credentials"
echo "5. Generate Nginx config: cd /opt/basa-app-prod && ./scripts/generate-nginx-config.sh"
echo "6. Set up SSL certificates: certbot --nginx -d yourdomain.com -d dev.yourdomain.com"
echo "7. Deploy applications when ready:"
echo "   - Production: deploy-basa-prod"
echo "   - Development: deploy-basa-dev" 