#!/bin/bash

# BASA Database Fix Script
# This script fixes database migration issues for existing databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log "🔧 Fixing BASA database migration issues..."

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    error "Prisma schema not found. Please run this script from the project root."
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    error "Production environment file not found. Please create .env.production first."
fi

# Stop the application container if it's running
log "🛑 Stopping application container..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down basa-app || true

# Wait a moment for the container to stop
sleep 5

# Try different database setup strategies
log "🔍 Attempting database setup strategies..."

# Strategy 1: Try to resolve migrations
log "📦 Strategy 1: Attempting to resolve migrations..."
if npx prisma migrate resolve --applied 20250624201603_init 2>/dev/null; then
    success "Migration resolved successfully!"
    if npx prisma migrate deploy; then
        success "Migrations deployed successfully!"
        exit 0
    fi
else
    warning "Could not resolve migrations, trying next strategy..."
fi

# Strategy 2: Try schema push
log "📦 Strategy 2: Attempting schema push..."
if npx prisma db push --accept-data-loss; then
    success "Schema pushed successfully!"
    exit 0
else
    warning "Schema push failed, trying next strategy..."
fi

# Strategy 3: Reset and migrate (WARNING: This will lose data)
log "📦 Strategy 3: Reset and migrate (WARNING: This will lose all data!)"
read -p "This will delete all data in the database. Are you sure? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npx prisma migrate reset --force; then
        success "Database reset and migrated successfully!"
        exit 0
    else
        error "Database reset failed!"
    fi
else
    warning "Database reset cancelled."
fi

# Strategy 4: Manual intervention
log "📦 Strategy 4: Manual intervention required"
echo ""
echo "All automatic strategies failed. Please try one of these manual approaches:"
echo ""
echo "1. Connect to the database and manually create the _prisma_migrations table:"
echo "   docker exec -it basa-postgres-prod psql -U basa_user -d basa_prod"
echo "   CREATE TABLE _prisma_migrations ("
echo "     id VARCHAR(36) PRIMARY KEY NOT NULL,"
echo "     checksum VARCHAR(64) NOT NULL,"
echo "     finished_at TIMESTAMP(3),"
echo "     migration_name VARCHAR(255) NOT NULL,"
echo "     logs TEXT,"
echo "     rolled_back_at TIMESTAMP(3),"
echo "     started_at TIMESTAMP(3) NOT NULL DEFAULT now(),"
echo "     applied_steps_count INTEGER NOT NULL DEFAULT 0"
echo "   );"
echo ""
echo "2. Or use prisma db push to sync the schema:"
echo "   npx prisma db push --accept-data-loss"
echo ""
echo "3. Or reset the database completely:"
echo "   npx prisma migrate reset --force"
echo ""

error "Manual intervention required. Please choose one of the options above." 