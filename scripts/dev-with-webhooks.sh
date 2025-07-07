#!/bin/bash

# Development script with Stripe webhook forwarding
# Usage: ./scripts/dev-with-webhooks.sh

set -e

echo "🚀 Starting BASA Development Environment with Stripe Webhooks..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed."
    echo "📦 Please install it first:"
    echo "   macOS: brew install stripe/stripe-cli/stripe"
    echo "   Windows: https://github.com/stripe/stripe-cli/releases"
    echo "   Linux: https://github.com/stripe/stripe-cli/releases"
    exit 1
fi

# Check if user is logged in to Stripe
if ! stripe config --list &> /dev/null; then
    echo "🔐 Please login to Stripe CLI first:"
    echo "   stripe login"
    exit 1
fi

# Check if webhook secret is set
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "⚠️  STRIPE_WEBHOOK_SECRET not found in environment"
    echo "🔧 Please set it in your .env.local file"
    echo "   You can get it from: https://dashboard.stripe.com/webhooks"
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development environment..."
    kill $DEV_PID $WEBHOOK_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📡 Starting Stripe webhook listener..."
echo "   Forwarding webhooks to: http://localhost:3000/api/webhooks/stripe"
echo ""

# Start webhook listener in background
stripe listen --forward-to localhost:3000/api/webhooks/stripe &
WEBHOOK_PID=$!

# Wait a moment for webhook listener to start
sleep 2

echo "🌐 Starting Next.js development server..."
echo ""

# Start development server in background
npm run dev &
DEV_PID=$!

echo "✅ Development environment started!"
echo "📱 Next.js server: http://localhost:3000"
echo "📡 Stripe webhooks: Forwarding to localhost:3000/api/webhooks/stripe"
echo ""
echo "🔧 Available commands:"
echo "   - Visit http://localhost:3000/dev/email-preview to test emails"
echo "   - Use Stripe CLI to trigger test webhooks"
echo "   - Check server logs for webhook processing"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"

# Wait for both processes
wait 