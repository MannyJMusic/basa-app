#!/bin/bash

# Local Development Script
# This script starts the BASA app in local development mode using Docker Compose

set -e

echo "🚀 Starting BASA Local Development Environment..."

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "Please create .env.development with your development environment variables."
    echo "You can copy from .env.example and adjust as needed."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop or Docker daemon and try again."
    exit 1
fi

# Stop any existing containers to avoid conflicts
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# Build and start the services
echo "📦 Building and starting services..."
docker-compose -f docker-compose.local.yml up --build

echo ""
echo "✅ Local development environment is running!"
echo "🌐 App: http://localhost:3000"
echo "🗄️  Database: localhost:5433"
echo ""
echo "To stop the services, run: ./scripts/stop-local.sh"
echo "To view logs, run: docker-compose -f docker-compose.local.yml logs -f" 