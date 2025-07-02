#!/bin/bash

# Generate Nginx Configuration Script
# This script generates the actual Nginx configuration from the template

set -e

# Configuration
TEMPLATE_FILE="nginx/basa-app.conf.template"
OUTPUT_FILE="nginx/basa-app.conf"
ENV_FILE=".env.domains"

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

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    error "Template file $TEMPLATE_FILE not found!"
fi

# Load domain configuration
if [ -f "$ENV_FILE" ]; then
    log "📄 Loading domain configuration from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    warning "Domain configuration file $ENV_FILE not found!"
    echo "Please create $ENV_FILE with the following content:"
    echo "PRODUCTION_DOMAIN=yourdomain.com"
    echo "DEV_DOMAIN=dev.yourdomain.com"
    echo ""
    echo "For example:"
    echo "PRODUCTION_DOMAIN=businessassociationsa.com"
    echo "DEV_DOMAIN=dev.businessassociationsa.com"
    exit 1
fi

# Validate domain variables
if [ -z "$PRODUCTION_DOMAIN" ] || [ -z "$DEV_DOMAIN" ]; then
    error "PRODUCTION_DOMAIN and DEV_DOMAIN must be set in $ENV_FILE"
fi

log "🌐 Generating Nginx configuration..."
echo "   Production Domain: $PRODUCTION_DOMAIN"
echo "   Development Domain: $DEV_DOMAIN"

# Generate configuration from template
log "📝 Creating Nginx configuration..."
envsubst '${PRODUCTION_DOMAIN} ${DEV_DOMAIN}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

# Fix the gzip_proxied directive issue (remove must-revalidate)
sed -i 's/gzip_proxied expired no-cache no-store private must-revalidate auth;/gzip_proxied expired no-cache no-store private auth;/g' "$OUTPUT_FILE"

# Validate generated configuration (only if nginx is available)
if command -v nginx &> /dev/null; then
    if nginx -t -c "$OUTPUT_FILE"; then
        success "Nginx configuration generated and validated successfully!"
        log "📁 Output file: $OUTPUT_FILE"
    else
        error "Generated Nginx configuration is invalid!"
        log "📋 Configuration validation failed. Please check the generated file below:"
        echo "-------------------"
        cat "$OUTPUT_FILE"
        echo "-------------------"
        exit 1
    fi
else
    success "Nginx configuration generated successfully! (nginx not available for validation)"
    log "📁 Output file: $OUTPUT_FILE"
    warning "Nginx validation skipped (nginx not available locally)"
fi

# Show usage instructions
log "📋 Next steps:"
echo "1. Copy the generated configuration to your server:"
echo "   sudo cp $OUTPUT_FILE /etc/nginx/sites-available/basa-app"
echo ""
echo "2. Enable the site:"
echo "   sudo ln -sf /etc/nginx/sites-available/basa-app /etc/nginx/sites-enabled/"
echo ""
echo "3. Test and reload Nginx:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Set up SSL certificates:"
echo "   sudo certbot --nginx -d $PRODUCTION_DOMAIN -d www.$PRODUCTION_DOMAIN"
echo "   sudo certbot --nginx -d $DEV_DOMAIN" 