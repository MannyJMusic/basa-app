#!/bin/bash

# BASA SSH Setup Diagnostic Script
# This script helps diagnose SSH deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo "🔍 BASA SSH Deployment Diagnostic Tool"
echo "======================================"
echo ""

# Check if we're on a server or local machine
if [ -f "/etc/os-release" ]; then
    log "Running on server - checking server-side SSH setup..."
    
    # Check if basa user exists
    if id "basa" &>/dev/null; then
        success "User 'basa' exists"
    else
        error "User 'basa' does not exist"
        echo "Run: sudo useradd -m -s /bin/bash -G docker basa"
    fi
    
    # Check SSH directory and permissions
    if [ -d "/home/basa/.ssh" ]; then
        success "SSH directory exists"
        
        # Check permissions
        perms=$(stat -c "%a" /home/basa/.ssh)
        if [ "$perms" = "700" ]; then
            success "SSH directory permissions are correct (700)"
        else
            error "SSH directory permissions are incorrect: $perms (should be 700)"
            echo "Run: sudo chmod 700 /home/basa/.ssh"
        fi
        
        # Check authorized_keys
        if [ -f "/home/basa/.ssh/authorized_keys" ]; then
            success "authorized_keys file exists"
            
            # Check permissions
            perms=$(stat -c "%a" /home/basa/.ssh/authorized_keys)
            if [ "$perms" = "600" ]; then
                success "authorized_keys permissions are correct (600)"
            else
                error "authorized_keys permissions are incorrect: $perms (should be 600)"
                echo "Run: sudo chmod 600 /home/basa/.ssh/authorized_keys"
            fi
            
            # Check if it has content
            if [ -s "/home/basa/.ssh/authorized_keys" ]; then
                success "authorized_keys has content"
                echo "Public keys in authorized_keys:"
                cat /home/basa/.ssh/authorized_keys | wc -l
            else
                error "authorized_keys is empty"
            fi
        else
            error "authorized_keys file does not exist"
            echo "Run: sudo -u basa touch /home/basa/.ssh/authorized_keys"
        fi
    else
        error "SSH directory does not exist"
        echo "Run: sudo -u basa mkdir -p /home/basa/.ssh"
    fi
    
    # Check SSH service
    if systemctl is-active --quiet ssh; then
        success "SSH service is running"
    else
        error "SSH service is not running"
        echo "Run: sudo systemctl start ssh"
    fi
    
    # Check SSH configuration
    if grep -q "PubkeyAuthentication yes" /etc/ssh/sshd_config; then
        success "SSH public key authentication is enabled"
    else
        warning "SSH public key authentication may not be enabled"
        echo "Check: sudo grep -i pubkey /etc/ssh/sshd_config"
    fi
    
    # Check if app directories exist
    if [ -d "/opt/basa-app-prod" ]; then
        success "Production app directory exists"
        
        if [ -f "/opt/basa-app-prod/scripts/deploy-simple.sh" ]; then
            success "Production deployment script exists"
            
            if [ -x "/opt/basa-app-prod/scripts/deploy-simple.sh" ]; then
                success "Production deployment script is executable"
            else
                error "Production deployment script is not executable"
                echo "Run: chmod +x /opt/basa-app-prod/scripts/*.sh"
            fi
        else
            error "Production deployment script not found"
        fi
    else
        error "Production app directory does not exist"
    fi
    
    if [ -d "/opt/basa-app-dev" ]; then
        success "Development app directory exists"
        
        if [ -f "/opt/basa-app-dev/scripts/deploy-dev.sh" ]; then
            success "Development deployment script exists"
            
            if [ -x "/opt/basa-app-dev/scripts/deploy-dev.sh" ]; then
                success "Development deployment script is executable"
            else
                error "Development deployment script is not executable"
                echo "Run: chmod +x /opt/basa-app-dev/scripts/*.sh"
            fi
        else
            error "Development deployment script not found"
        fi
    else
        error "Development app directory does not exist"
    fi
    
else
    log "Running on local machine - checking local SSH setup..."
    
    # Check if SSH key exists
    if [ -f "$HOME/.ssh/basa_deploy_key" ]; then
        success "Deployment SSH key exists"
        
        # Check permissions
        perms=$(stat -c "%a" "$HOME/.ssh/basa_deploy_key" 2>/dev/null || stat -f "%Lp" "$HOME/.ssh/basa_deploy_key")
        if [ "$perms" = "600" ]; then
            success "SSH key permissions are correct (600)"
        else
            error "SSH key permissions are incorrect: $perms (should be 600)"
            echo "Run: chmod 600 ~/.ssh/basa_deploy_key"
        fi
        
        # Show public key for easy copying
        echo ""
        log "Your public key (add this to server authorized_keys):"
        echo "=================================================="
        cat "$HOME/.ssh/basa_deploy_key.pub"
        echo "=================================================="
        echo ""
    else
        error "Deployment SSH key does not exist"
        echo "Run: ssh-keygen -t ed25519 -C 'basa-deployment@github.com' -f ~/.ssh/basa_deploy_key"
    fi
    
    # Check if we can connect to servers (if IPs are provided)
    if [ -n "$1" ]; then
        log "Testing SSH connection to $1..."
        if ssh -i "$HOME/.ssh/basa_deploy_key" -o ConnectTimeout=10 -o StrictHostKeyChecking=no basa@"$1" "echo 'SSH connection successful'" 2>/dev/null; then
            success "SSH connection to $1 successful"
        else
            error "SSH connection to $1 failed"
            echo "Check your SSH key setup and server configuration"
        fi
    fi
fi

echo ""
echo "📋 Next Steps:"
echo "1. If any errors were found, fix them using the provided commands"
echo "2. Set up GitHub secrets as described in docs/SSH_DEPLOYMENT_SETUP.md"
echo "3. Test deployment by pushing to dev/main branch"
echo ""

if [ -f "/etc/os-release" ]; then
    echo "🔧 Server-side fixes needed:"
    echo "   - Run the setup scripts if directories don't exist"
    echo "   - Add your public key to /home/basa/.ssh/authorized_keys"
    echo "   - Ensure all scripts are executable"
else
    echo "🔧 Local setup needed:"
    echo "   - Generate SSH key pair if not exists"
    echo "   - Add public key to both servers"
    echo "   - Configure GitHub secrets"
fi

echo ""
echo "📚 For detailed instructions, see: docs/SSH_DEPLOYMENT_SETUP.md" 