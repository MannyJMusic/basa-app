#!/bin/bash

# BASA Server Setup Script
# This script sets up a fresh Ubuntu server for BASA application deployment
# Run this on a fresh Ubuntu server to provision infrastructure and clone repositories

set -e

# Configuration
APP_USER="basa"
APP_GROUP="basa"
PROD_DIR="/opt/basa-app-prod"
DEV_DIR="/opt/basa-app-dev"
BACKUP_DIR="/opt/basa-backups"
NGINX_CONF="/etc/nginx/sites-available/basa-app"
GITHUB_REPO="https://github.com/MannyJMusic/basa-app.git"

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

log "🚀 Starting BASA Server Setup on Fresh Ubuntu Server..."

# Update system packages
log "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log "📦 Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    tree

# Install Docker
log "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    success "Docker installed successfully"
else
    warning "Docker is already installed"
fi

# Install Docker Compose (standalone)
log "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed successfully"
else
    warning "Docker Compose is already installed"
fi

# Create application user
log "👤 Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G docker "$APP_USER"
    success "User $APP_USER created successfully"
else
    warning "User $APP_USER already exists"
fi

# Create application directories
log "📁 Creating application directories..."
mkdir -p "$PROD_DIR" "$DEV_DIR" "$BACKUP_DIR"
chown -R "$APP_USER:$APP_USER" "$PROD_DIR" "$DEV_DIR" "$BACKUP_DIR"
chmod -R 755 "$PROD_DIR" "$DEV_DIR" "$BACKUP_DIR"

# Configure firewall
log "🔥 Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
success "Firewall configured successfully"

# Configure fail2ban
log "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
success "Fail2ban configured successfully"

# Clone repositories
log "📥 Cloning BASA repositories from GitHub..."

# Clone production repository
log "📥 Cloning production repository to $PROD_DIR..."
if [ -d "$PROD_DIR/.git" ]; then
    warning "Production directory already contains a git repository"
    log "Updating existing repository..."
    cd "$PROD_DIR"
    sudo -u "$APP_USER" git pull origin main
else
    sudo -u "$APP_USER" git clone "$GITHUB_REPO" "$PROD_DIR"
fi

# Clone development repository
log "📥 Cloning development repository to $DEV_DIR..."
if [ -d "$DEV_DIR/.git" ]; then
    warning "Development directory already contains a git repository"
    log "Updating existing repository..."
    cd "$DEV_DIR"
    sudo -u "$APP_USER" git pull origin main
else
    sudo -u "$APP_USER" git clone "$GITHUB_REPO" "$DEV_DIR"
fi

# Set up environment files
log "⚙️ Setting up environment files..."

# Create .env.domains template
if [ ! -f "$PROD_DIR/.env.domains" ]; then
    log "📄 Creating .env.domains template..."
    cat > "$PROD_DIR/.env.domains" << 'DOMAINEOF'
# Domain Configuration for BASA Application
# Replace with your actual domains

# Production domain
PRODUCTION_DOMAIN=yourdomain.com

# Development domain
DEV_DOMAIN=dev.yourdomain.com

# Optional: Additional domains
# WWW_DOMAIN=www.yourdomain.com
# API_DOMAIN=api.yourdomain.com
DOMAINEOF
    chown "$APP_USER:$APP_USER" "$PROD_DIR/.env.domains"
    warning "Please edit $PROD_DIR/.env.domains with your actual domain names"
fi

# Create production environment template
if [ ! -f "$PROD_DIR/.env.production" ]; then
    log "📄 Creating production environment template..."
    cat > "$PROD_DIR/.env.production" << 'PRODENVEOF'
# Production Environment Configuration
# Replace with your actual credentials

NODE_ENV=production
DATABASE_URL=postgresql://basa_user:basa_password@localhost:5432/basa_prod
POSTGRES_DB=basa_prod
POSTGRES_USER=basa_user
POSTGRES_PASSWORD=basa_password

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-key-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Mailgun Configuration
MAILGUN_API_KEY=key-your_mailgun_api_key
MAILGUN_DOMAIN=yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# Sentry Configuration (optional)
SENTRY_DSN=your_sentry_dsn_here

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=basa_prod
DATABASE_USER=basa_user
DATABASE_PASSWORD=basa_password
PRODENVEOF
    chown "$APP_USER:$APP_USER" "$PROD_DIR/.env.production"
    warning "Please edit $PROD_DIR/.env.production with your actual credentials"
fi

# Create development environment template
if [ ! -f "$DEV_DIR/.env.development" ]; then
    log "📄 Creating development environment template..."
    cat > "$DEV_DIR/.env.development" << 'DEVENVEOF'
# Development Environment Configuration
# Replace with your actual credentials

NODE_ENV=development
DATABASE_URL=postgresql://basa_user:basa_password@localhost:5432/basa_dev
POSTGRES_DB=basa_dev
POSTGRES_USER=basa_user
POSTGRES_PASSWORD=basa_password

# NextAuth Configuration
NEXTAUTH_URL=https://dev.yourdomain.com
NEXTAUTH_SECRET=your-development-secret-key-here
NEXT_PUBLIC_APP_URL=https://dev.yourdomain.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Mailgun Configuration
MAILGUN_API_KEY=key-your_mailgun_api_key
MAILGUN_DOMAIN=yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# Sentry Configuration (optional)
SENTRY_DSN=your_sentry_dsn_here

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=basa_dev
DATABASE_USER=basa_user
DATABASE_PASSWORD=basa_password
DEVENVEOF
    chown "$APP_USER:$APP_USER" "$DEV_DIR/.env.development"
    warning "Please edit $DEV_DIR/.env.development with your actual credentials"
fi

# Set proper permissions on scripts
log "🔧 Setting up script permissions..."
chmod +x "$PROD_DIR/scripts/"*.sh 2>/dev/null || true
chmod +x "$DEV_DIR/scripts/"*.sh 2>/dev/null || true

# Configure Nginx (basic setup - will be configured after cloning)
log "🌐 Configuring Nginx..."

# Create symbolic link (will be updated after cloning)
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if nginx -t; then
    systemctl enable nginx
    systemctl restart nginx
    success "Nginx configured successfully"
else
    warning "Nginx configuration test failed - will need manual configuration"
fi

# Create deployment scripts
log "📝 Creating deployment scripts..."
cat > /usr/local/bin/deploy-basa-dev << 'EOF'
#!/bin/bash
cd /opt/basa-app-dev
if [ -f ".env.development" ]; then
    docker-compose -f docker-compose.dev.yml --env-file .env.development up -d --build
else
    echo "Error: .env.development file not found. Please create it first."
    exit 1
fi
EOF

cat > /usr/local/bin/deploy-basa-prod << 'EOF'
#!/bin/bash
cd /opt/basa-app-prod
if [ -f ".env.production" ]; then
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
else
    echo "Error: .env.production file not found. Please create it first."
    exit 1
fi
EOF

cat > /usr/local/bin/stop-basa-dev << 'EOF'
#!/bin/bash
cd /opt/basa-app-dev
docker-compose -f docker-compose.dev.yml down
EOF

cat > /usr/local/bin/stop-basa-prod << 'EOF'
#!/bin/bash
cd /opt/basa-app-prod
docker-compose -f docker-compose.prod.yml down
EOF

chmod +x /usr/local/bin/deploy-basa-dev /usr/local/bin/deploy-basa-prod /usr/local/bin/stop-basa-dev /usr/local/bin/stop-basa-prod

# Set up log rotation
log "📋 Setting up log rotation..."
cat > /etc/logrotate.d/basa-app << 'EOF'
/opt/basa-app-*/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 basa basa
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Create monitoring script
log "📊 Creating monitoring script..."
cat > /usr/local/bin/monitor-basa << 'EOF'
#!/bin/bash
echo "=== BASA Application Status ==="
echo "Production:"
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml ps 2>/dev/null || echo "Production not running"
echo ""
echo "Development:"
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml ps 2>/dev/null || echo "Development not running"
echo ""
echo "=== System Resources ==="
df -h
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Docker Resources ==="
docker system df
EOF

chmod +x /usr/local/bin/monitor-basa

# Set up automatic backups
log "💾 Setting up automatic backups..."
cat > /etc/cron.daily/basa-backup << 'EOF'
#!/bin/bash
cd /opt/basa-app-prod
if [ -f "scripts/deploy-prod.sh" ]; then
    ./scripts/deploy-prod.sh backup
fi
EOF

chmod +x /etc/cron.daily/basa-backup

# Configure Nginx after repositories are cloned
log "🌐 Configuring Nginx with cloned repositories..."

# Generate Nginx configuration if .env.domains exists and has real domains
if [ -f "$PROD_DIR/.env.domains" ]; then
    source "$PROD_DIR/.env.domains"
    if [ "$PRODUCTION_DOMAIN" != "yourdomain.com" ] && [ "$DEV_DOMAIN" != "dev.yourdomain.com" ]; then
        log "📄 Generating Nginx configuration with domains: $PRODUCTION_DOMAIN, $DEV_DOMAIN"
        cd "$PROD_DIR"
        sudo -u "$APP_USER" ./scripts/generate-nginx-config.sh
        cp "$PROD_DIR/nginx/basa-app.conf" "$NGINX_CONF"
        
        # Test and reload Nginx
        if nginx -t; then
            systemctl reload nginx
            success "Nginx configured successfully with domains"
        else
            warning "Nginx configuration test failed - will need manual configuration"
        fi
    else
        warning "Please update $PROD_DIR/.env.domains with your actual domain names before generating Nginx config"
    fi
else
    warning "Domain configuration file not found at $PROD_DIR/.env.domains"
fi

# Final setup instructions
success "🎉 Server setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Edit $PROD_DIR/.env.domains with your actual domain names"
echo "3. Edit $PROD_DIR/.env.production with your actual service credentials"
echo "4. Edit $DEV_DIR/.env.development with your actual service credentials"
echo "5. Generate Nginx config: cd $PROD_DIR && ./scripts/generate-nginx-config.sh"
echo "6. Set up SSL certificates: certbot --nginx -d yourdomain.com -d dev.yourdomain.com"
echo "7. Deploy applications when ready:"
echo "   - Production: deploy-basa-prod"
echo "   - Development: deploy-basa-dev"
echo ""
echo "🔧 Useful commands:"
echo "  deploy-basa-prod    - Deploy production version"
echo "  deploy-basa-dev     - Deploy development version"
echo "  stop-basa-prod      - Stop production version"
echo "  stop-basa-dev       - Stop development version"
echo "  monitor-basa        - Check application status"
echo "  docker system prune - Clean up Docker resources"
echo ""
echo "📁 Application directories:"
echo "  Production: $PROD_DIR"
echo "  Development: $DEV_DIR"
echo "  Backups: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: Applications are NOT started automatically."
echo "   Configure your environment files first, then deploy manually." 