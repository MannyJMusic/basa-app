# BASA Application CI/CD Deployment Guide

This guide provides a complete workflow for deploying both development and production versions of the BASA application to your Ubuntu server on Hostinger.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [GitHub Repository Configuration](#github-repository-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Workflow](#deployment-workflow)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline consists of:

- **GitHub Actions**: Automated testing, building, and deployment
- **Docker**: Containerized application deployment
- **Nginx**: Reverse proxy and SSL termination
- **PostgreSQL**: Database management
- **Automated backups**: Daily backup system
- **Health monitoring**: Application health checks

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  GitHub Actions │    │  Ubuntu Server  │
│                 │    │                 │    │                 │
│  main branch    │───▶│  Test & Build   │───▶│  Production     │
│  develop branch │───▶│  Deploy Dev     │───▶│  Development    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Server Requirements

- Ubuntu 20.04+ server on Hostinger
- Minimum 2GB RAM
- 20GB+ storage
- Root access or sudo privileges
- Domain name (for SSL certificates)

### Local Development

- Git
- Docker (optional for local testing)
- Node.js 18+ (for local development)

## Server Setup

### 1. Initial Server Configuration

**Recommended:** Run the setup script on a fresh Ubuntu server for complete automation.

```bash
# SSH into your fresh Ubuntu server
ssh root@your-server-ip

# Download and run the setup script from GitHub
curl -fsSL https://raw.githubusercontent.com/MannyJMusic/basa-app/main/scripts/fetch-and-run-setup.sh | bash
```

This script will:
- Download the setup script from GitHub
- Update system packages
- Install Docker and Docker Compose
- Install Nginx and configure reverse proxy
- Set up firewall and security
- Create application directories (`/opt/basa-app-prod` and `/opt/basa-app-dev`)
- Clone both production and development repositories from GitHub
- Set up environment file templates
- Configure automatic backups
- Create deployment scripts (`deploy-basa-prod`, `deploy-basa-dev`)
- **NOT start the application automatically** (you configure environment files first)

**Alternative:** If you prefer manual control:

```bash
# Download the setup script manually
wget https://raw.githubusercontent.com/MannyJMusic/basa-app/main/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

**Note:** The setup script is the single source of truth for server provisioning. It sets up infrastructure but does NOT start the application - you configure environment files first, then deploy manually.

### 2. Environment Configuration

After the server setup, you need to configure your environment files:

1. **Configure domain settings:**
   ```bash
   # Edit the domain configuration
   nano /opt/basa-app-prod/.env.domains
   ```
   
   Replace the placeholder domains with your actual domains:
   ```env
   PRODUCTION_DOMAIN=yourdomain.com
   DEV_DOMAIN=dev.yourdomain.com
   ```

2. **Configure production environment:**
   ```bash
   # Edit the production environment
   nano /opt/basa-app-prod/.env.production
   ```
   
   Update with your actual credentials:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://basa_user:basa_password@localhost:5432/basa_prod
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-actual-secret-key
   STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
   MAILGUN_API_KEY=key-your_actual_mailgun_key
   # ... other credentials
   ```

3. **Configure development environment:**
   ```bash
   # Edit the development environment
   nano /opt/basa-app-dev/.env.development
   ```
   
   Update with your development credentials (similar to production but with dev domain).

4. **Generate Nginx configuration:**
   ```bash
   cd /opt/basa-app-prod
   ./scripts/generate-nginx-config.sh
   sudo systemctl reload nginx
   ```

### 3. Domain Configuration

Configure your domain DNS to point to your server:

```
Type    Name    Value
A       @       YOUR_SERVER_IP
A       www     YOUR_SERVER_IP
A       dev     YOUR_SERVER_IP
```

### 4. SSL Certificate Setup

After DNS propagation, set up SSL certificates:

```bash
# Production domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Development subdomain
sudo certbot --nginx -d dev.yourdomain.com
```

### 5. Deploy Applications

Once your environment is configured, deploy the applications:

```bash
# Deploy production
deploy-basa-prod

# Deploy development
deploy-basa-dev

# Check status
monitor-basa
```

**Useful deployment commands:**
- `deploy-basa-prod` - Deploy production version
- `deploy-basa-dev` - Deploy development version  
- `stop-basa-prod` - Stop production version
- `stop-basa-dev` - Stop development version
- `monitor-basa` - Check application status

## Nginx Configuration Generation

The script `scripts/generate-nginx-config.sh` is used by the setup script to generate your Nginx config from a template. It:
- Substitutes your domain variables from `.env.domains`
- Fixes known issues (e.g., `gzip_proxied` directive)
- Validates the config with `nginx -t`
- If validation fails, prints the error and the generated config for easy debugging

**If you see an error like:**
```
[ERROR] Generated Nginx configuration is invalid!
nginx: [emerg] open() "/usr/share/nginx/nginx/basa-app.conf" failed (2: No such file or directory)
```
- Check that the generated config path is correct and matches your Nginx setup
- Review the printed config for missing or incorrect domain variables
- Make sure `.env.domains` is present and correct
- If you see empty `server_name` or other variables, fix `.env.domains` and re-run the setup script
- If you see a `gzip_proxied` error, the script should now fix this automatically

**After fixing any issues, simply re-run the setup script:**
```bash
sudo /tmp/setup-server.sh
```

**Manual steps are only for debugging.**

## GitHub Repository Configuration

### 1. Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
SSH_PRIVATE_KEY     - Your server's SSH private key
SERVER_HOST         - Your server's IP address or domain
SERVER_USER         - Username for SSH access (usually 'basa')
PRODUCTION_DOMAIN   - Your production domain (e.g., businessassociationsa.com)
```

### 2. Branch Protection

Set up branch protection rules:

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
3. Add rule for `develop` branch:
   - Require status checks to pass

## Domain Configuration

### 1. Set Up Domain Configuration

Create a domain configuration file that will be kept private:

```bash
# Copy the example file
cp .env.domains.example .env.domains

# Edit with your actual domains
nano .env.domains
```

Add your domain configuration:
```env
# Production domain (your main website)
PRODUCTION_DOMAIN=businessassociationsa.com

# Development domain (for testing)
DEV_DOMAIN=dev.businessassociationsa.com
```

**Important:** Never commit `.env.domains` to version control. It's already added to `.gitignore`.

### 2. Generate Nginx Configuration

Generate the actual Nginx configuration from the template:

```bash
# Make the script executable
chmod +x scripts/generate-nginx-config.sh

# Generate configuration
./scripts/generate-nginx-config.sh
```

This will create `nginx/basa-app.conf` with your actual domains.

If you encounter errors, see the troubleshooting section below.

## Environment Configuration

### 1. Production Environment

Create `.env.production` on your server:

```bash
cd /opt/basa-app-prod
cp .env.example .env.production
nano .env.production
```

Required variables:
```env
# Database
DATABASE_URL="postgresql://basa_user:basa_password@postgres:5432/basa_prod"
POSTGRES_DB="basa_prod"
POSTGRES_USER="basa_user"
POSTGRES_PASSWORD="secure_password"

# Next.js & Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="yourdomain.com"
MAILGUN_FROM_EMAIL="noreply@yourdomain.com"

# Sentry
SENTRY_DSN="https://..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-token"

# Environment
NODE_ENV="production"
```

### 2. Development Environment

Create `.env.local` on your server:

```bash
cd /opt/basa-app-dev
cp .env.example .env.local
nano .env.local
```

Required variables:
```env
# Database
DATABASE_URL="postgresql://basa_user:basa_password@postgres:5432/basa_dev"
POSTGRES_DB="basa_dev"
POSTGRES_USER="basa_user"
POSTGRES_PASSWORD="secure_password"

# Next.js & Auth
NEXTAUTH_URL="http://dev.yourdomain.com"
NEXTAUTH_SECRET="your-dev-secret-key"

# Stripe (use test keys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="yourdomain.com"
MAILGUN_FROM_EMAIL="noreply@yourdomain.com"

# Environment
NODE_ENV="development"
```

## Deployment Workflow

### 1. Development Deployment

Development deployments are triggered by pushes to the `develop` branch:

```bash
# Local development workflow
git checkout develop
git add .
git commit -m "Add new feature"
git push origin develop
```

The GitHub Actions workflow will:
1. Run tests and build the application
2. Deploy to development environment
3. Run health checks
4. Notify on success/failure

### 2. Production Deployment

Production deployments are triggered by pushes to the `main` branch:

```bash
# Production deployment workflow
git checkout main
git merge develop
git push origin main
```

The GitHub Actions workflow will:
1. Run tests and build the application
2. Create backup of current production
3. Deploy to production environment
4. Run health checks
5. Rollback on failure
6. Notify on success/failure

### 3. Manual Deployment

For manual deployments, use the provided scripts:

```bash
# Deploy development
sudo -u basa deploy-basa-dev

# Deploy production
sudo -u basa deploy-basa-prod

# Create backup only
sudo -u basa deploy-basa-prod backup

# Rollback production
sudo -u basa deploy-basa-prod rollback [backup_file]
```

## Monitoring and Maintenance

### 1. Application Monitoring

Check application status:

```bash
# View application status
monitor-basa

# View container logs
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml logs -f
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml logs -f

# Check system resources
htop
df -h
docker system df
```

### 2. Database Management

```bash
# Access production database
docker exec -it basa-postgres-prod psql -U basa_user -d basa_prod

# Access development database
docker exec -it basa-postgres-dev psql -U basa_user -d basa_dev

# Backup database
docker exec basa-postgres-prod pg_dump -U basa_user basa_prod > backup.sql
```

### 3. Log Management

```bash
# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml logs -f basa-app
```

### 4. Maintenance Tasks

```bash
# Clean up Docker resources
docker system prune -a

# Update system packages
sudo apt update && sudo apt upgrade

# Renew SSL certificates
sudo certbot renew

# Check disk space
df -h
du -sh /opt/basa-*
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check container status
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml ps

# View logs
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml logs

# Check environment variables
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml config
```

#### 2. Database Connection Issues

```bash
# Check database container
docker exec -it basa-postgres-prod pg_isready -U basa_user

# Check database logs
docker logs basa-postgres-prod

# Test connection
docker exec -it basa-postgres-prod psql -U basa_user -d basa_prod -c "SELECT 1;"
```

#### 3. Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check certificate files
ls -la /etc/letsencrypt/live/yourdomain.com/
```

### Emergency Procedures

#### 1. Complete Rollback

```bash
# Stop all containers
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml down
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml down

# Restore from backup
cd /opt/basa-app-prod
./scripts/deploy-prod.sh rollback

# Restart services
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml up -d
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml up -d
```

#### 2. Database Recovery

```bash
# Stop application
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml down

# Restore database
docker exec -i basa-postgres-prod psql -U basa_user -d basa_prod < backup.sql

# Restart application
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml up -d
```

## Security Considerations

### 1. Firewall Configuration

The setup script configures UFW firewall with:
- SSH access only
- HTTP/HTTPS ports open
- Application ports (3000, 3001) open

### 2. Fail2ban Protection

Fail2ban is configured to protect against:
- SSH brute force attacks
- Nginx access violations

### 3. SSL/TLS Security

- TLS 1.2+ only
- Strong cipher suites
- HSTS headers
- Security headers

### 4. Docker Security

- Non-root user for application
- Read-only root filesystem
- Resource limits
- Network isolation

## Performance Optimization

### 1. Nginx Optimization

- Gzip compression enabled
- Static file caching
- Connection keepalive
- Worker processes optimization

### 2. Docker Optimization

- Multi-stage builds
- Layer caching
- Resource limits
- Health checks

### 3. Database Optimization

- Connection pooling
- Query optimization
- Regular maintenance
- Backup strategies

## Support and Resources

### Documentation
- [BASA Application Documentation](./README.md)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Monitoring Tools
- Application logs: Docker logs
- System monitoring: htop, df, free
- Network monitoring: netstat, ss
- Database monitoring: pg_stat_activity

### Backup Strategy
- Daily automated backups
- 5 backup retention
- Database and application state
- Off-site backup recommended

---

This CI/CD deployment guide provides a robust, scalable solution for managing both development and production environments of your BASA application on Ubuntu/Hostinger infrastructure. 