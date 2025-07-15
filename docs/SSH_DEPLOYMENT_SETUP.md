# SSH Deployment Setup Guide

## Overview

This guide will help you set up SSH deployment for your BASA application CI/CD pipeline. The deployment uses SSH keys to securely connect to your production and development servers.

## Prerequisites

1. **Production VPS** - Your dedicated production server
2. **Development VPS** - Your dedicated development server  
3. **GitHub Repository** - Your BASA app repository
4. **SSH Access** - Ability to SSH into both servers

## Step 1: Generate SSH Key Pair

### On Your Local Machine

```bash
# Generate a new SSH key pair for deployment
ssh-keygen -t ed25519 -C "basa-deployment@github.com" -f ~/.ssh/basa_deploy_key

# This will create:
# ~/.ssh/basa_deploy_key (private key)
# ~/.ssh/basa_deploy_key.pub (public key)
```

## Step 2: Add Public Key to Servers

### Production Server

```bash
# SSH into your production server
ssh root@your-production-server-ip

# Add the public key to the basa user
sudo -u basa mkdir -p /home/basa/.ssh
sudo -u basa chmod 700 /home/basa/.ssh
sudo -u basa touch /home/basa/.ssh/authorized_keys
sudo -u basa chmod 600 /home/basa/.ssh/authorized_keys

# Copy your public key content and add it to authorized_keys
echo "YOUR_PUBLIC_KEY_CONTENT_HERE" | sudo -u basa tee -a /home/basa/.ssh/authorized_keys
```

### Development Server

```bash
# SSH into your development server
ssh root@your-development-server-ip

# Add the public key to the basa user
sudo -u basa mkdir -p /home/basa/.ssh
sudo -u basa chmod 700 /home/basa/.ssh
sudo -u basa touch /home/basa/.ssh/authorized_keys
sudo -u basa chmod 600 /home/basa/.ssh/authorized_keys

# Copy your public key content and add it to authorized_keys
echo "YOUR_PUBLIC_KEY_CONTENT_HERE" | sudo -u basa tee -a /home/basa/.ssh/authorized_keys
```

## Step 3: Test SSH Connection

### Test Production Server
```bash
# Test SSH connection to production server
ssh -i ~/.ssh/basa_deploy_key basa@your-production-server-ip
```

### Test Development Server
```bash
# Test SSH connection to development server
ssh -i ~/.ssh/basa_deploy_key basa@your-development-server-ip
```

## Step 4: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets

#### Production Secrets
- **`PROD_SERVER_HOST`** - Your production server IP address
- **`PROD_SERVER_USER`** - `basa` (the user we created)
- **`SSH_PRIVATE_KEY`** - The entire content of your private key file (`~/.ssh/basa_deploy_key`)
- **`PRODUCTION_DOMAIN`** - `https://app.businessassociationsa.com`

#### Development Secrets
- **`DEV_SERVER_HOST`** - Your development server IP address
- **`DEV_SERVER_USER`** - `basa` (the user we created)
- **`SSH_PRIVATE_KEY`** - The same private key (can be shared between environments)
- **`DEVELOPMENT_DOMAIN`** - `https://dev.businessassociationsa.com`

### How to Add SSH_PRIVATE_KEY Secret

1. Copy the entire content of your private key:
```bash
cat ~/.ssh/basa_deploy_key
```

2. In GitHub, create a new secret named `SSH_PRIVATE_KEY`
3. Paste the entire private key content (including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines)

## Step 5: Verify Server Setup

### Production Server Verification

```bash
# SSH into production server
ssh -i ~/.ssh/basa_deploy_key basa@your-production-server-ip

# Check if the app directory exists
ls -la /opt/basa-app-prod

# Check if scripts are executable
ls -la /opt/basa-app-prod/scripts/

# Check if environment file exists
ls -la /opt/basa-app-prod/.env.production
```

### Development Server Verification

```bash
# SSH into development server
ssh -i ~/.ssh/basa_deploy_key basa@your-development-server-ip

# Check if the app directory exists
ls -la /opt/basa-app-dev

# Check if scripts are executable
ls -la /opt/basa-app-dev/scripts/

# Check if environment file exists
ls -la /opt/basa-app-dev/.env.development
```

## Step 6: Test Deployment

### Test Development Deployment
1. Push a change to the `dev` branch
2. Check the GitHub Actions tab
3. Verify the deployment succeeds

### Test Production Deployment
1. Push a change to the `main` branch
2. Check the GitHub Actions tab
3. Verify the deployment succeeds

## Troubleshooting

### Common Issues

#### 1. SSH Connection Refused
```bash
# Check if SSH service is running
sudo systemctl status ssh

# Check SSH configuration
sudo nano /etc/ssh/sshd_config

# Ensure these settings are correct:
# PermitRootLogin no
# PubkeyAuthentication yes
# PasswordAuthentication no
```

#### 2. Permission Denied
```bash
# Check file permissions
ls -la /home/basa/.ssh/
ls -la /home/basa/.ssh/authorized_keys

# Fix permissions if needed
sudo chmod 700 /home/basa/.ssh
sudo chmod 600 /home/basa/.ssh/authorized_keys
sudo chown -R basa:basa /home/basa/.ssh
```

#### 3. GitHub Actions SSH Failure
- Verify all secrets are correctly set in GitHub
- Check that the private key includes the header and footer lines
- Ensure the server host and user are correct
- Test SSH connection manually first

#### 4. Deployment Script Not Found
```bash
# Check if deployment scripts exist
ls -la /opt/basa-app-prod/scripts/
ls -la /opt/basa-app-dev/scripts/

# Make scripts executable if needed
chmod +x /opt/basa-app-prod/scripts/*.sh
chmod +x /opt/basa-app-dev/scripts/*.sh
```

### Debug Commands

#### Check SSH Agent in GitHub Actions
```bash
# Add this to your workflow for debugging
- name: Debug SSH
  run: |
    echo "SSH agent status:"
    ssh-add -l
    echo "SSH known hosts:"
    cat ~/.ssh/known_hosts
    echo "Testing SSH connection:"
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${{ secrets.PROD_SERVER_USER }}@${{ secrets.PROD_SERVER_HOST }} "echo 'SSH connection successful'"
```

#### Check Server Logs
```bash
# On the server, check SSH logs
sudo tail -f /var/log/auth.log

# Check application logs
docker-compose -f /opt/basa-app-prod/docker-compose.prod.yml logs
```

## Security Best Practices

1. **Use dedicated deployment keys** - Don't use your personal SSH keys
2. **Restrict SSH access** - Only allow key-based authentication
3. **Regular key rotation** - Rotate deployment keys periodically
4. **Monitor access logs** - Keep an eye on SSH access logs
5. **Use different keys per environment** - Consider using separate keys for prod/dev

## Next Steps

Once SSH deployment is working:

1. **Set up SSL certificates** using Let's Encrypt
2. **Configure monitoring** and alerting
3. **Set up automated backups**
4. **Implement rollback procedures**
5. **Add deployment notifications** (Slack, email, etc.)

## Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly configured
3. Test SSH connections manually
4. Check server logs for authentication issues
5. Ensure all required scripts and files exist on the servers 