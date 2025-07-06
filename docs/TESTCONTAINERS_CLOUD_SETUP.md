# Testcontainers Cloud Setup Guide

## Overview

Testcontainers Cloud provides managed containers for testing, eliminating the need for Docker on CI/CD runners and providing faster, more reliable test execution.

## Benefits

- **No Docker Required**: GitHub Actions runners don't need Docker installed
- **Faster Startup**: Cloud containers start faster than local ones
- **More Reliable**: Managed infrastructure reduces flaky tests
- **Scalable**: Can run multiple test suites in parallel

## Setup Instructions

### 1. Get Your Testcontainers Cloud Token

1. Visit [Testcontainers Cloud](https://app.testcontainers.cloud/)
2. Sign up for a free account
3. Navigate to your account settings
4. Copy your API token

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `TC_CLOUD_TOKEN`
5. Value: Paste your token from step 1
6. Click **Add secret**

### 3. Verify Setup

#### Local Verification
```bash
# Set your token locally (for testing)
export TC_CLOUD_TOKEN=your_token_here

# Run verification script
pnpm verify:testcontainers
```

#### GitHub Actions Verification
1. Push a commit to trigger the workflow
2. Check the logs for:
   ```
   ✅ Testcontainers Cloud token is configured
   🌐 Tests will use Testcontainers Cloud
   ```

## Configuration

### Environment Variables

The following environment variables are automatically handled:

- `TC_CLOUD_TOKEN`: Your Testcontainers Cloud API token
- `DATABASE_URL`: Automatically set to the cloud container URL
- `PRISMA_CLIENT_ENGINE_TYPE`: Set to 'binary' for optimal performance

### Automatic Detection

The test setup automatically detects the presence of `TC_CLOUD_TOKEN`:

```typescript
// Automatically uses cloud when token is present
const isCloudEnvironment = !!process.env.TC_CLOUD_TOKEN;

if (isCloudEnvironment) {
  console.log('🌐 Using Testcontainers Cloud environment');
} else {
  console.log('🏠 Using local Testcontainers environment');
}
```

## Usage

### Running Tests

```bash
# Run integration tests (uses cloud if token is set)
pnpm test:integration

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### GitHub Actions

The workflow automatically:
1. Detects the `TC_CLOUD_TOKEN` secret
2. Uses Testcontainers Cloud when available
3. Falls back to local Testcontainers if token is missing
4. Provides detailed logging about which environment is used

## Troubleshooting

### Token Not Configured

**Error**: `❌ Testcontainers Cloud token is not configured`

**Solution**: 
1. Follow the setup instructions above
2. Ensure the secret name is exactly `TC_CLOUD_TOKEN`
3. Re-run the workflow

### Connection Issues

**Error**: `ECONNREFUSED` or connection timeout

**Solutions**:
1. Verify your token is valid
2. Check Testcontainers Cloud service status
3. Ensure internet connectivity from your CI/CD environment

### Local Testing

If you want to test locally without Testcontainers Cloud:

```bash
# Remove the token to use local Testcontainers
unset TC_CLOUD_TOKEN

# Run tests
pnpm test:integration
```

## Cost Considerations

- **Free Tier**: Testcontainers Cloud offers a generous free tier
- **Usage Limits**: Check your account dashboard for current usage
- **Billing**: Set up billing alerts to monitor usage

## Migration from Local Testcontainers

If you're migrating from local Testcontainers:

1. **No Code Changes**: The same test code works with both local and cloud
2. **Automatic Fallback**: Tests automatically use local if cloud token is missing
3. **Gradual Migration**: You can test cloud setup while keeping local as backup

## Support

- **Documentation**: [Testcontainers Cloud Docs](https://www.testcontainers.org/cloud/)
- **Community**: [Testcontainers Discord](https://discord.gg/testcontainers)
- **Issues**: Report issues in the GitHub repository

## Example Workflow Output

```
Setting up Testcontainers Cloud...
✅ Testcontainers Cloud token is configured

🔍 Verifying Testcontainers setup...
✅ Testcontainers Cloud token is present
🌐 Tests will use Testcontainers Cloud

🧪 Starting comprehensive integration tests...
🌐 Testcontainers Cloud enabled: YES
📊 Running tests with Testcontainers Cloud...

🌐 Using Testcontainers Cloud environment
   - Containers will be created in the cloud
   - No local Docker required
   - Faster container startup

🚀 Creating cloud PostgreSQL container...
✅ PostgreSQL container started successfully (cloud)
   - Database URL: postgresql://test_user:test_password@host:port/basa_test
``` 