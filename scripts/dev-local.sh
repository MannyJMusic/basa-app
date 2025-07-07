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

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "⚠️  Stripe CLI not found. Webhook forwarding will not be available."
    echo "📦 To install: brew install stripe/stripe-cli/stripe"
    echo ""
fi

# Stop any existing containers to avoid conflicts
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development environment..."
    kill $WEBHOOK_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Stripe webhook listener if CLI is available
if command -v stripe &> /dev/null; then
    echo "📡 Starting Stripe webhook listener..."
    echo "   Forwarding webhooks to: http://localhost:3000/api/webhooks/stripe"
    echo ""
    
    # Start webhook listener in background
    stripe listen --forward-to localhost:3000/api/webhooks/stripe &
    WEBHOOK_PID=$!
    
    # Wait a moment for webhook listener to start
    sleep 2
fi

# Build and start the services
echo "📦 Building and starting services..."
docker-compose -f docker-compose.local.yml up --build

echo ""
echo "✅ Local development environment is running!"
echo "🌐 App: http://localhost:3000"
echo "🗄️  Database: localhost:5433"
if command -v stripe &> /dev/null; then
    echo "📡 Stripe webhooks: Forwarding to localhost:3000/api/webhooks/stripe"
fi
echo ""
echo "To stop the services, run: ./scripts/stop-local.sh"
echo "To view logs, run: docker-compose -f docker-compose.local.yml logs -f" 