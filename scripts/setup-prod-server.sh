#!/bin/bash

# BASA Production Server Setup Script
# Run this on a fresh Ubuntu server for production deployment
# This script sets up a DEDICATED VPS for production use only
# DO NOT run this on the development server
set -e

APP_USER="basa"
PROD_DIR="/opt/basa-app-prod"
GITHUB_REPO="https://github.com/MannyJMusic/basa-app.git"
NGINX_CONF="/etc/nginx/sites-available/basa-app-prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then error "This script must be run as root (use sudo)"; fi

log "🚀 Starting BASA Production Server Setup..."
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release nginx certbot python3-certbot-nginx ufw fail2ban htop tree

# Docker
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

log "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed successfully"
else
    warning "Docker Compose is already installed"
fi

log "👤 Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G docker "$APP_USER"
    success "User $APP_USER created successfully"
else
    warning "User $APP_USER already exists"
fi

log "📁 Creating application directory..."
mkdir -p "$PROD_DIR"
chown -R "$APP_USER:$APP_USER" "$PROD_DIR"
chmod -R 755 "$PROD_DIR"

log "🔥 Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
success "Firewall configured successfully"

log "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
success "Fail2ban configured successfully"

log "📥 Cloning BASA production repository..."
if [ -d "$PROD_DIR/.git" ]; then
    warning "Production directory already contains a git repository"
    cd "$PROD_DIR"
    sudo -u "$APP_USER" git pull origin main
else
    sudo -u "$APP_USER" git clone "$GITHUB_REPO" "$PROD_DIR"
fi

log "⚙️ Setting up environment file..."
if [ ! -f "$PROD_DIR/.env.production" ]; then
    cat > "$PROD_DIR/.env.production" << 'PRODENVEOF'
# Production Environment Configuration
NODE_ENV=production
DATABASE_URL=postgresql://basa_user:basa_password@localhost:5432/basa_prod
POSTGRES_DB=basa_prod
POSTGRES_USER=basa_user
POSTGRES_PASSWORD=basa_password
NEXTAUTH_URL=https://app.businessassociationsa.com
NEXTAUTH_SECRET=your-production-secret-key-here
NEXT_PUBLIC_APP_URL=https://app.businessassociationsa.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MAILGUN_API_KEY=key-your_mailgun_api_key
MAILGUN_DOMAIN=yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
SENTRY_DSN=your_sentry_dsn_here
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=basa_prod
DATABASE_USER=basa_user
DATABASE_PASSWORD=basa_password
PRODENVEOF
    chown "$APP_USER:$APP_USER" "$PROD_DIR/.env.production"
    warning "Please edit $PROD_DIR/.env.production with your actual credentials"
fi

log "🔧 Setting up script permissions..."
chmod +x "$PROD_DIR/scripts/"*.sh 2>/dev/null || true

log "🌐 Configuring Nginx for production..."
cat > "$NGINX_CONF" << 'NGINXEOF'
server {
    listen 80;
    server_name app.businessassociationsa.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline';" always;
}
NGINXEOF
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/basa-app-prod
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx && success "Nginx configured successfully"

log "📝 Creating deployment scripts..."
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
cat > /usr/local/bin/stop-basa-prod << 'EOF'
#!/bin/bash
cd /opt/basa-app-prod
docker-compose -f docker-compose.prod.yml down
EOF
chmod +x /usr/local/bin/deploy-basa-prod /usr/local/bin/stop-basa-prod

success "🎉 Production server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit $PROD_DIR/.env.production with your actual credentials."
echo "2. Point your DNS for app.businessassociationsa.com to this server."
echo "3. Run: deploy-basa-prod to deploy the app."
echo "4. Set up SSL: sudo certbot --nginx -d app.businessassociationsa.com"
echo "5. Monitor: docker-compose -f $PROD_DIR/docker-compose.prod.yml ps"
echo ""
echo "🔧 CI/CD Configuration:"
echo "  Add these GitHub secrets for production deployment:"
echo "  - PROD_SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "  - PROD_SERVER_USER: $APP_USER"
echo "  - SSH_PRIVATE_KEY: Your SSH private key for deployment"
echo "  - PRODUCTION_DOMAIN: https://app.businessassociationsa.com"
echo ""
echo "Useful commands:"
echo "  deploy-basa-prod    - Deploy production version"
echo "  stop-basa-prod      - Stop production version"
echo "  docker system prune - Clean up Docker resources"
echo ""
echo "Production directory: $PROD_DIR"
echo ""
echo "⚠️  IMPORTANT: This is a DEDICATED production server."
echo "   Development deployments should use the separate development VPS." 