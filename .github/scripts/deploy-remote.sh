#!/bin/bash
# Runs on the production server via: ssh user@host 'bash -s' < this-file
# No GitHub secret interpolation happens inside this file - it is piped
# to the remote bash as-is over stdin, which avoids the whole class of
# quoting/interpolation bugs that come from mixing ${{ secrets.* }}
# substitution with multi-line quoted strings directly in the workflow YAML.
set -e

echo "=== Starting Deployment ==="
cd /opt/basa-app

# Pull latest code
echo "Pulling latest code..."
git fetch origin
git reset --hard origin/main || git reset --hard origin/master

# Build and deploy with Docker
echo "Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Stop old containers gracefully
echo "Stopping old containers..."
docker compose -f docker-compose.prod.yml down

# Start new containers
echo "Starting new containers..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T basa-app npx prisma migrate deploy || true

# Health check
echo "Checking application health..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -f http://localhost:3000/api/health; then
    echo ""
    echo "Health check passed!"
    break
  fi
  echo "Waiting for app to become healthy... (attempt $i/10)"
  sleep 5
done

# Cleanup old images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "=== Deployment Complete ==="
