#!/bin/bash

# BASA Server Setup Script
# This script sets up the Ubuntu server for BASA application deployment

set -e

# Configuration
APP_USER="basa"
APP_GROUP="basa"
PROD_DIR="/opt/basa-app-prod"
DEV_DIR="/opt/basa-app-dev"
BACKUP_DIR="/opt/basa-backups"
NGINX_CONF="/etc/nginx/sites-available/basa-app"

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

log "🚀 Starting BASA Server Setup..."

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

# Configure Nginx
log "🌐 Configuring Nginx..."
# Generate Nginx configuration from template
if [ -f ".env.domains" ]; then
    log "📄 Using domain configuration from .env.domains"
    ./scripts/generate-nginx-config.sh
    cp nginx/basa-app.conf "$NGINX_CONF"
else
    warning "Domain configuration file .env.domains not found!"
    echo "Please create .env.domains with your domain configuration:"
    echo "PRODUCTION_DOMAIN=yourdomain.com"
    echo "DEV_DOMAIN=dev.yourdomain.com"
    echo ""
    echo "Then run: ./scripts/generate-nginx-config.sh"
    echo "And copy the generated config: sudo cp nginx/basa-app.conf $NGINX_CONF"
fi

# Create symbolic link
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if nginx -t; then
    systemctl enable nginx
    systemctl restart nginx
    success "Nginx configured successfully"
else
    error "Nginx configuration test failed"
fi

# Set up SSL certificates (optional - requires domain)
log "🔒 SSL Certificate Setup"
echo "To set up SSL certificates, run:"
echo "  certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "  certbot --nginx -d dev.yourdomain.com"
echo ""
echo "Replace 'yourdomain.com' with your actual domain from .env.domains"

# Create deployment scripts
log "📝 Creating deployment scripts..."
cat > /usr/local/bin/deploy-basa-dev << 'EOF'
#!/bin/bash
cd /opt/basa-app-dev
./scripts/deploy-dev.sh
EOF

cat > /usr/local/bin/deploy-basa-prod << 'EOF'
#!/bin/bash
cd /opt/basa-app-prod
./scripts/deploy-prod.sh
EOF

chmod +x /usr/local/bin/deploy-basa-dev /usr/local/bin/deploy-basa-prod

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
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml ps
echo ""
echo "Development:"
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml ps
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
./scripts/deploy-prod.sh backup
EOF

chmod +x /etc/cron.daily/basa-backup

# Final setup instructions
success "🎉 Server setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Create .env.domains with your domain configuration"
echo "3. Generate Nginx config: ./scripts/generate-nginx-config.sh"
echo "4. Set up SSL certificates: certbot --nginx -d yourdomain.com"
echo "5. Clone your repository to /opt/basa-app-prod and /opt/basa-app-dev"
echo "6. Create .env.production and .env.local files"
echo "7. Run initial deployment: deploy-basa-prod"
echo ""
echo "🔧 Useful commands:"
echo "  deploy-basa-prod    - Deploy production version"
echo "  deploy-basa-dev     - Deploy development version"
echo "  monitor-basa        - Check application status"
echo "  docker system prune - Clean up Docker resources"
echo ""
echo "📁 Application directories:"
echo "  Production: $PROD_DIR"
echo "  Development: $DEV_DIR"
echo "  Backups: $BACKUP_DIR" 