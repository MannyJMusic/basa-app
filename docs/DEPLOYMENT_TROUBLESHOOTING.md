# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Git Ownership Issues

**Error Message:**
```
fatal: detected dubious ownership in repository at '/opt/basa-app-dev'
```

**Cause:**
Git detects that the repository is owned by a different user than the one running the Git commands, which is a security feature to prevent malicious code execution.

**Solution:**
The GitHub Actions workflow has been updated to automatically fix this issue by adding the repository directory to Git's safe directory list:

```bash
git config --global --add safe.directory /opt/basa-app-dev
```

**Manual Fix:**
If you encounter this issue manually, run:
```bash
git config --global --add safe.directory /path/to/your/repository
```

### 2. Divergent Branches Issues

**Error Message:**
```
hint: You have divergent branches and need to specify how to reconcile them.
fatal: Need to specify how to reconcile divergent branches.
```

**Cause:**
The local repository on the server has commits that differ from the remote repository, causing Git to refuse automatic merging.

**Solution:**
The GitHub Actions workflow has been updated to handle this automatically using:
```bash
git fetch origin
git reset --hard origin/dev
```

**Manual Fix:**
Run the dedicated fix script:
```bash
./scripts/fix-divergent-branches.sh
```

### 3. Script Not Found Errors

**Error Message:**
```
-bash: line 1: ./scripts/deploy-dev.sh: No such file or directory
```

**Causes:**
- Git pull failed due to ownership issues
- Git pull failed due to divergent branches
- Script file doesn't exist in the repository
- Script permissions are incorrect

**Solutions:**
1. **Fix Git ownership first** (see above)
2. **Fix divergent branches** (see above)
3. **Verify script exists:**
   ```bash
   ls -la scripts/deploy-dev.sh
   ```
4. **Make script executable:**
   ```bash
   chmod +x scripts/*.sh
   ```

### 4. Docker Issues

**Common Problems:**
- Docker not running
- Docker Compose not installed
- Port conflicts
- Insufficient disk space

**Solutions:**
1. **Start Docker:**
   ```bash
   sudo systemctl start docker
   ```
2. **Install Docker Compose:**
   ```bash
   sudo apt-get install docker-compose
   ```
3. **Check for port conflicts:**
   ```bash
   netstat -tlnp | grep :3001
   ```
4. **Check disk space:**
   ```bash
   df -h
   ```

## Debug Tools

### Debug Script
A comprehensive debug script has been created at `scripts/debug-deployment-issues.sh` that checks:

- Current user and directory
- Git repository status and ownership
- Docker and Docker Compose availability
- Required file existence
- Script permissions
- Disk space
- Container status
- Port usage

**Usage:**
```bash
./scripts/debug-deployment-issues.sh
```

### GitHub Actions Improvements

The CI/CD workflow has been enhanced with:

1. **Automatic Git ownership fixes**
2. **Better error reporting**
3. **Debug script integration**
4. **File existence verification**
5. **Improved logging**

## Prevention

### Best Practices

1. **Consistent User Setup:**
   - Use the same user for Git operations and deployment
   - Configure proper file ownership on the server

2. **Regular Maintenance:**
   - Run the debug script periodically
   - Monitor disk space and Docker resources
   - Keep Docker images updated

3. **Environment Consistency:**
   - Use the same environment variables across deployments
   - Maintain consistent file permissions
   - Regular backup of configuration files

### Server Setup Checklist

- [ ] Create dedicated user for deployments
- [ ] Configure SSH keys properly
- [ ] Install Docker and Docker Compose
- [ ] Set up proper file permissions
- [ ] Configure Git safe directories
- [ ] Set up environment variables
- [ ] Test deployment scripts

## Emergency Procedures

### Quick Recovery

1. **Stop all containers:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Fix Git issues:**
   ```bash
   cd /opt/basa-app-dev
   ./scripts/fix-divergent-branches.sh
   ```

3. **Redeploy:**
   ```bash
   ./scripts/deploy-dev.sh
   ```

### Rollback Procedure

1. **Check previous commits:**
   ```bash
   git log --oneline -5
   ```

2. **Reset to previous commit:**
   ```bash
   git reset --hard HEAD~1
   ```

3. **Redeploy:**
   ```bash
   ./scripts/deploy-dev.sh
   ```

## Support

If you continue to experience issues:

1. Run the debug script and share the output
2. Check the GitHub Actions logs for detailed error messages
3. Verify server configuration matches the setup checklist
4. Review recent changes that might have caused the issue

## Related Documentation

- [Environment Setup Guide](../wiki/Environment-Setup.md)
- [Admin Settings Guide](ADMIN_SETTINGS.md)
- [BASA Design System](BASA_DESIGN_SYSTEM.md) 