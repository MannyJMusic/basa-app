#!/bin/bash

# BASA Application Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo "🚀 Deploying BASA Application to $ENVIRONMENT environment..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found!"
    echo "Please create $ENV_FILE with your production environment variables."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down

# Remove old images (optional, uncomment if needed)
# echo "🧹 Cleaning up old images..."
# docker image prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build

# Wait for containers to be healthy
echo "⏳ Waiting for containers to be healthy..."
sleep 30

# Check application health
echo "🏥 Checking application health..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Application is healthy!"
    echo "🌐 Application is running at: http://localhost:3000"
else
    echo "❌ Application health check failed (HTTP $HEALTH_CHECK)"
    echo "📋 Checking container logs..."
    docker-compose -f $COMPOSE_FILE logs --tail=50
    exit 1
fi

echo "🎉 Deployment completed successfully!"

# Show container status
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps 