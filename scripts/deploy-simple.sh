#!/bin/bash

# Simple Production Deployment Script
# This script can be run manually on the production server

set -e

echo "🚀 Starting simple production deployment..."

# Navigate to production directory
cd /opt/basa-app-prod

echo "📁 Working directory: $(pwd)"
echo "👤 Current user: $(whoami)"

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ Production environment file not found: .env.production"
    echo "Please create it from the example file:"
    echo "cp .env.production.example .env.production"
    echo "Then edit it with your production values"
    exit 1
fi

# Check if Docker Compose file exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Docker Compose file not found: docker-compose.prod.yml"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans 2>/dev/null || echo "No containers to stop"

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f 2>/dev/null || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 30

# Check container status
echo "🔍 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Check application health
echo "🏥 Checking application health..."
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f "http://localhost:3000/api/health" > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⚠️  Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 10 seconds..."
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Application health check failed after $MAX_RETRIES attempts"
    echo "📋 Container logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Show final status
echo "📊 Final deployment status:"
echo "========================"
docker-compose -f docker-compose.prod.yml ps

# Show application URLs
echo "🌐 Application URLs:"
echo "   Production: http://localhost:3000"
echo "   Health Check: http://localhost:3000/api/health"

echo "🎉 Production deployment completed successfully!"
echo ""
echo "💡 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Restart: docker-compose -f docker-compose.prod.yml restart"
echo "   - Stop: docker-compose -f docker-compose.prod.yml down" 