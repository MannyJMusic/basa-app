#!/bin/sh

# Docker startup script for BASA development environment
# This script ensures the database is migrated and seeded before starting the app

set -e

echo "🚀 Starting BASA development environment..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h postgres -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
  echo "Database not ready yet, waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if we need to seed the database
echo "🌱 Checking if database needs seeding..."
SEED_CHECK=$(echo "SELECT COUNT(*) as count FROM \"User\" WHERE role = 'ADMIN';" | npx prisma db execute --stdin 2>/dev/null | grep -o '[0-9]*' || echo "0")

if [ "$SEED_CHECK" = "0" ]; then
  echo "🌱 Seeding database with initial data..."
  pnpm run db:seed
  echo "✅ Database seeded successfully!"
else
  echo "✅ Database already has data, skipping seeding"
fi

# Start the development server
echo "🚀 Starting Next.js development server..."
exec pnpm dev 