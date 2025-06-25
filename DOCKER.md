# Docker Setup for BASA Application

This document provides instructions for running the BASA application using Docker for both development and production environments.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Development Environment

### Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd basa-app
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual environment variables.

3. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application:**
   - Application: http://localhost:3000
   - Database: localhost:5432

### Development Features

- **Hot Reload**: Changes to your local files are immediately reflected in the container
- **Volume Mapping**: The entire project directory is mapped to `/app` in the container
- **Database Persistence**: PostgreSQL data is persisted in a Docker volume
- **Health Checks**: Database health checks ensure proper startup order

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Access container shell
docker exec -it basa-app-dev sh

# Run database migrations
docker exec -it basa-app-dev pnpm db:migrate

# Seed database
docker exec -it basa-app-dev pnpm db:seed
```

## Production Environment

### VPS Deployment

1. **Clone the repository on your VPS:**
   ```bash
   git clone <repository-url>
   cd basa-app
   ```

2. **Create production environment file:**
   ```bash
   cp .env.example .env.production
   ```
   Edit `.env.production` with your production environment variables.

3. **Build and start production environment:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

### Production Features

- **Multi-stage Build**: Optimized production image with minimal size
- **Non-root User**: Application runs as non-root user for security
- **Health Checks**: Application and database health monitoring
- **Environment Variables**: All configuration via environment variables
- **Restart Policy**: Automatic restart on failure

### Production Commands

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml down

# Update application
git pull
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Backup database
docker exec basa-postgres-prod pg_dump -U basa_user basa_prod > backup.sql

# Restore database
docker exec -i basa-postgres-prod psql -U basa_user basa_prod < backup.sql
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your application URL | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `your-secret-key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `MAILGUN_API_KEY` | Mailgun API key | `key-...` |
| `MAILGUN_DOMAIN` | Mailgun domain | `yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `basa_prod` |
| `POSTGRES_USER` | Database user | `basa_user` |
| `POSTGRES_PASSWORD` | Database password | `basa_password` |
| `SENTRY_DSN` | Sentry DSN for error tracking | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |

## Database Management

### Initial Setup

```bash
# Run migrations
docker exec -it basa-app-dev pnpm db:migrate

# Seed database
docker exec -it basa-app-dev pnpm db:seed
```

### Backup and Restore

```bash
# Create backup
docker exec basa-postgres-prod pg_dump -U basa_user basa_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i basa-postgres-prod psql -U basa_user basa_prod < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Check database health
   docker exec basa-postgres-prod pg_isready -U basa_user
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container won't start:**
   ```bash
   # Check container logs
   docker logs basa-app-dev
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

### Health Checks

The application includes health checks at `/api/health` that verify:
- Application is running
- Database connection is working

You can test it manually:
```bash
curl http://localhost:3000/api/health
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Passwords**: Use strong, unique passwords for production
3. **Network Security**: Consider using Docker networks for isolation
4. **Updates**: Regularly update Docker images and dependencies
5. **Backups**: Implement regular database backups

## Performance Optimization

1. **Resource Limits**: Set appropriate CPU and memory limits
2. **Caching**: Use Docker layer caching for faster builds
3. **Database**: Consider using connection pooling for high traffic
4. **Monitoring**: Implement application and infrastructure monitoring

## Support

For issues related to Docker setup, check:
1. Docker logs: `docker-compose logs`
2. Application logs: `docker logs <container-name>`
3. Database logs: `docker logs postgres`
4. Health check endpoint: `http://localhost:3000/api/health` 