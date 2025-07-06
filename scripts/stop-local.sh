#!/bin/bash

# Stop Local Development Script
# This script stops the BASA local development environment

set -e

echo "🛑 Stopping BASA Local Development Environment..."

# Stop and remove containers
docker-compose -f docker-compose.local.yml down --remove-orphans

echo "✅ Local development environment stopped!"
echo ""
echo "To remove volumes as well, run: docker-compose -f docker-compose.local.yml down -v"
echo "To remove all data and start fresh, run: docker-compose -f docker-compose.local.yml down -v && docker system prune -f" 