#!/bin/bash

# Fix Production Prisma Engine Issue
# This script fixes the PRISMA_QUERY_ENGINE_BINARY error

set -e

echo "🔧 Fixing Prisma engine issue..."

# Navigate to production directory
cd /opt/basa-app-prod

echo "📁 Working directory: $(pwd)"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found"
    exit 1
fi

# Remove any incorrect Prisma environment variables
echo "🧹 Cleaning up Prisma environment variables..."

# Remove the problematic variable if it exists
if grep -q "PRISMA_QUERY_ENGINE_BINARY" .env.production; then
    echo "⚠️  Found PRISMA_QUERY_ENGINE_BINARY in .env.production, removing it..."
    sed -i '/PRISMA_QUERY_ENGINE_BINARY/d' .env.production
fi

# Ensure the correct variable is set
if ! grep -q "PRISMA_QUERY_ENGINE_TYPE" .env.production; then
    echo "✅ Adding PRISMA_QUERY_ENGINE_TYPE=binary to .env.production..."
    echo "PRISMA_QUERY_ENGINE_TYPE=binary" >> .env.production
else
    echo "✅ PRISMA_QUERY_ENGINE_TYPE already set in .env.production"
fi

# Stop any running containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down 2>/dev/null || echo "No containers to stop"

# Clean up Docker cache
echo "🧹 Cleaning Docker cache..."
docker system prune -f 2>/dev/null || true

# Remove any existing images
echo "🗑️  Removing existing images..."
docker rmi $(docker images -q basa-app-prod_basa-app 2>/dev/null) 2>/dev/null || echo "No images to remove"

# Show the current environment variables
echo "📋 Current Prisma environment variables in .env.production:"
grep -i prisma .env.production || echo "No Prisma variables found"

echo "✅ Prisma environment variables fixed!"
echo ""
echo "🚀 You can now run the deployment:"
echo "   ./scripts/deploy-simple.sh" 