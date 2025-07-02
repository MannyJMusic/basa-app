# Docker Setup for BASA Application

## Overview

This document provides instructions for running the BASA application using Docker in both development and production environments.

## Development Environment

### Prerequisites

- Docker and Docker Compose installed
- `.env.local` file with your local development environment variables

### Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   cd basa-app
   ```

2. **Create your `.env.local` file**
   ```bash
   cp .env .env.local
   # Edit .env.local with your local development settings
   ```

3. **Start the development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

### What Happens During Startup

The development environment automatically:

1. **Starts PostgreSQL database** with health checks
2. **Waits for database to be ready** before proceeding
3. **Generates Prisma client** for database operations
4. **Runs database migrations** to ensure schema is up to date
5. **Seeds the database** with initial data (admin users, settings, sample members)
6. **Starts Next.js development server** with hot reloading

### Database Migration and Seeding

The development environment includes automatic database setup:

- **Migrations**: All Prisma migrations are automatically applied
- **Seeding**: Initial data is seeded only if no admin users exist
- **Health Checks**: Database connectivity is verified before starting the app

### Accessing the Application

- **Main Application**: http://localhost:3000
- **Database**: localhost:5432 (PostgreSQL)
- **Health Check**: http://localhost:3000/api/health

### Development Workflow

1. **Code Changes**: Automatically reflected due to volume mounting
2. **Database Changes**: Run migrations locally or restart containers
3. **Environment Variables**: Update `.env.local` and restart containers

### Troubleshooting

#### Database Connection Issues
```bash
# Check if database is running
docker-compose -f docker-compose.dev.yml ps

# View database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database (WARNING: This will delete all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

#### Application Issues
```bash
# View application logs
docker-compose -f docker-compose.dev.yml logs basa-app

# Restart application only
docker-compose -f docker-compose.dev.yml restart basa-app

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

## Production Environment

### Prerequisites

- Docker and Docker Compose installed
- Production environment variables configured
- SSL certificates (if using HTTPS)

### Deployment

1. **Configure production environment**
   ```bash
   # Set up production environment variables
   cp .env .env.production
   # Edit .env.production with production settings
   ```

2. **Build and start production environment**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

### Production Features

- **Multi-stage builds** for optimized images
- **Health checks** for both database and application
- **Restart policies** for high availability
- **Volume persistence** for database data
- **Network isolation** for security

## Environment Variables

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL for authentication
- `NEXTAUTH_SECRET`: Secret key for NextAuth
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

### Optional Variables

- `STRIPE_SECRET_KEY`: Stripe payment processing
- `MAILGUN_API_KEY`: Email service
- `SENTRY_DSN`: Error monitoring
- `NODE_ENV`: Environment mode

## Database Management

### Running Migrations

```bash
# Inside the container
docker-compose -f docker-compose.dev.yml exec basa-app pnpm run db:migrate

# Or locally with database connection
pnpm run db:migrate
```

### Seeding Database

```bash
# Inside the container
docker-compose -f docker-compose.dev.yml exec basa-app pnpm run db:seed

# Or locally
pnpm run db:seed
```

### Database Studio

```bash
# Access Prisma Studio
docker-compose -f docker-compose.dev.yml exec basa-app pnpm run db:studio
```

## Security Considerations

1. **Environment Files**: Never commit `.env.local` or `.env.production` to version control
2. **Database Passwords**: Use strong, unique passwords for production
3. **Network Access**: Limit database port exposure in production
4. **Volume Permissions**: Ensure proper file permissions for mounted volumes

## Performance Optimization

### Development

- **Volume Mounting**: Source code is mounted for hot reloading
- **Node Modules**: Excluded from volume mounting to prevent conflicts
- **Build Cache**: Leverages Docker layer caching

### Production

- **Multi-stage Builds**: Reduces final image size
- **Optimized Dependencies**: Only production dependencies included
- **Static Asset Optimization**: Next.js optimizations enabled

## Monitoring and Logs

### Health Checks

- **Database**: PostgreSQL readiness check
- **Application**: HTTP health endpoint at `/api/health`

### Logging

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs basa-app
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U basa_user basa_db > backup.sql

# Restore backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U basa_user basa_db < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v basa-app_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v basa-app_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
``` 