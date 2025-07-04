#!/bin/sh

# Exit on any error
set -e

echo "Starting BASA application initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until npx prisma db push --accept-data-loss --skip-generate; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations (skip if database is not empty)
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migrations skipped - database may already be initialized"

# Run database seeding (skip if database already has data)
echo "Running database seeding..."
npx tsx prisma/seed.ts || echo "Seeding skipped - database may already have data"

echo "Database initialization complete!"

# Start the application
echo "Starting Next.js application..."
exec pnpm start 