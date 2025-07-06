#!/bin/bash

# Quick Production Status Check
# Run this on your production server to quickly diagnose issues

echo "🔍 Quick Production Status Check"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "/opt/basa-app-prod" ]; then
    echo "❌ Production directory not found: /opt/basa-app-prod"
    exit 1
fi

cd /opt/basa-app-prod

echo "📁 Directory: $(pwd)"
echo "👤 User: $(whoami)"
echo ""

# Check Docker service
echo "🐳 Docker Service:"
if systemctl is-active --quiet docker; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running"
    echo "   Run: sudo systemctl start docker"
fi
echo ""

# Check containers
echo "📦 Container Status:"
if command -v docker-compose &> /dev/null; then
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        echo "❌ docker-compose.prod.yml not found"
    fi
else
    echo "❌ docker-compose not installed"
fi
echo ""

# Check environment file
echo "🔧 Environment File:"
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    echo "   Size: $(wc -l < .env.production) lines"
else
    echo "❌ .env.production not found"
    if [ -f ".env.production.example" ]; then
        echo "   💡 Copy: cp .env.production.example .env.production"
    fi
fi
echo ""

# Check application health
echo "🏥 Application Health:"
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is responding"
    echo "   Health check: http://localhost:3000/api/health"
else
    echo "❌ Application is not responding"
    echo "   Port 3000: $(netstat -tlnp | grep :3000 || echo 'Not listening')"
fi
echo ""

# Check recent logs
echo "📋 Recent Container Logs:"
if [ -f "docker-compose.prod.yml" ]; then
    echo "Last 10 lines from app container:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 basa-app-prod 2>/dev/null || echo "No logs available"
else
    echo "Cannot check logs - compose file not found"
fi
echo ""

# Quick fixes
echo "💡 Quick Fix Commands:"
echo "   Check status: ./scripts/check-production-status.sh"
echo "   Fix containers: ./scripts/fix-production-containers.sh"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
echo "   Stop all: docker-compose -f docker-compose.prod.yml down"
echo "   Start all: docker-compose -f docker-compose.prod.yml up -d" 