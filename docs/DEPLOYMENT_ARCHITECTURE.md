# BASA Deployment Architecture

## Overview

The BASA application uses a **dedicated VPS architecture** with separate servers for production and development environments. This ensures complete isolation between environments and prevents any interference between production and development deployments.

## Server Architecture

### Production Server (Dedicated VPS)
- **Purpose**: Live production environment
- **Domain**: `app.businessassociationsa.com`
- **Directory**: `/opt/basa-app-prod`
- **Setup Script**: `scripts/setup-prod-server.sh`
- **Docker Compose**: `docker-compose.prod.yml`

### Development Server (Dedicated VPS)
- **Purpose**: Development and staging environment
- **Domain**: `dev.businessassociationsa.com`
- **Directory**: `/opt/basa-app-dev`
- **Setup Script**: `scripts/setup-dev-server.sh`
- **Docker Compose**: `docker-compose.dev.yml`

## CI/CD Pipeline

### GitHub Secrets Required

#### Production Deployment Secrets
- `PROD_SERVER_HOST` - Production server IP/hostname
- `PROD_SERVER_USER` - SSH user for production server (usually `basa`)
- `SSH_PRIVATE_KEY` - SSH private key for deployment
- `PRODUCTION_DOMAIN` - Production domain URL

#### Development Deployment Secrets
- `DEV_SERVER_HOST` - Development server IP/hostname
- `DEV_SERVER_USER` - SSH user for development server (usually `basa`)
- `SSH_PRIVATE_KEY` - SSH private key for deployment (can be shared)
- `DEVELOPMENT_DOMAIN` - Development domain URL

### Deployment Triggers

#### Production Deployment
- **Automatic**: Push to `main` branch (with tests)
- **Manual**: Workflow dispatch with `skip_tests: true`
- **Manual**: Commit message containing `[skip-tests]`

#### Development Deployment
- **Automatic**: Push to `dev` branch (fast deployment, no tests)

## Setup Instructions

### 1. Production Server Setup

```bash
# On your production VPS
sudo bash scripts/setup-prod-server.sh
```

After setup, configure GitHub secrets:
- `PROD_SERVER_HOST`: Your production server IP
- `PROD_SERVER_USER`: `basa`
- `SSH_PRIVATE_KEY`: Your deployment SSH key
- `PRODUCTION_DOMAIN`: `https://app.businessassociationsa.com`

### 2. Development Server Setup

```bash
# On your development VPS
sudo bash scripts/setup-dev-server.sh
```

After setup, configure GitHub secrets:
- `DEV_SERVER_HOST`: Your development server IP
- `DEV_SERVER_USER`: `basa`
- `SSH_PRIVATE_KEY`: Your deployment SSH key
- `DEVELOPMENT_DOMAIN`: `https://dev.businessassociationsa.com`

## Deployment Commands

### Production Server
```bash
# Deploy production
deploy-basa-prod

# Stop production
stop-basa-prod

# Monitor containers
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml ps
```

### Development Server
```bash
# Deploy development
deploy-basa-dev

# Stop development
stop-basa-dev

# Monitor containers
docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml ps
```

## Environment Files

### Production Environment
- **File**: `/opt/basa-app-prod/.env.production`
- **Database**: `basa_prod`
- **Node Environment**: `production`

### Development Environment
- **File**: `/opt/basa-app-dev/.env.development`
- **Database**: `basa_dev`
- **Node Environment**: `development`

## Security Considerations

1. **Complete Isolation**: Production and development servers are completely separate
2. **Firewall Configuration**: Both servers have UFW configured with minimal open ports
3. **Fail2ban**: Both servers have fail2ban enabled for intrusion prevention
4. **SSL Certificates**: Each server manages its own SSL certificates
5. **User Permissions**: Dedicated `basa` user with limited privileges

## Monitoring and Maintenance

### Health Checks
- Production: `https://app.businessassociationsa.com/api/health`
- Development: `https://dev.businessassociationsa.com/api/health`

### Logs
- Production: `docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml logs`
- Development: `docker-compose -f /opt/basa-app-dev/docker-compose.dev.yml logs`

### Backup and Recovery
- Each server manages its own database backups
- Rollback procedures are built into the CI/CD pipeline
- Environment-specific configurations prevent cross-contamination

## Troubleshooting

### Common Issues

1. **Deployment Fails**: Check SSH keys and server connectivity
2. **Health Check Fails**: Verify container status and logs
3. **Database Issues**: Check environment variables and database connectivity
4. **SSL Issues**: Verify certificate renewal and nginx configuration

### Rollback Procedures

The CI/CD pipeline includes automatic rollback on deployment failure. Manual rollback can be performed by:

```bash
# On production server
cd /opt/basa-app-prod
git reset --hard HEAD~1
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Best Practices

1. **Never mix environments**: Keep production and development completely separate
2. **Test in development first**: Always test changes in development before production
3. **Monitor deployments**: Watch the CI/CD pipeline and health checks
4. **Regular backups**: Maintain regular database and configuration backups
5. **Security updates**: Keep both servers updated with security patches 