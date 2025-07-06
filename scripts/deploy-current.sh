#!/bin/bash

# Deploy Current Code Script
# This script deploys the current code without any Git operations

echo "🚀 Deploying current code without Git operations..."

# Navigate to production directory
cd /opt/basa-app-prod

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || echo "⚠️  Could not make all scripts executable"

# Run the deployment without Git requirements
./scripts/deploy-without-git.sh 