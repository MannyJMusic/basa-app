# Testcontainers Cloud Setup

This document explains how to set up Testcontainers Cloud for the BASA application's CI/CD pipeline.

## Overview

Testcontainers Cloud provides managed containers for testing, eliminating the need for Docker-in-Docker setups in CI environments. This makes our integration tests more reliable and faster.

## Setup Instructions

### 1. Get Testcontainers Cloud Token

1. Visit [Testcontainers Cloud](https://app.testcontainers.cloud/accounts/31796/start/download?group=ci)
2. Sign up or log in to your account
3. Navigate to your account settings
4. Generate a new API token for CI/CD

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `TESTCONTAINERS_CLOUD_TOKEN`
5. Value: Your Testcontainers Cloud API token
6. Click **Add secret**

### 3. GitHub Actions Configuration

The workflow is already configured in `.github/workflows/ci-cd.yml` to use Testcontainers Cloud:

```yaml
- name: Setup Testcontainers Cloud
  run: |
    echo "Setting up Testcontainers Cloud..."
    echo "TC_CLOUD_TOKEN=${{ secrets.TESTCONTAINERS_CLOUD_TOKEN }}" >> $GITHUB_ENV
    echo "Testcontainers Cloud environment configured"

- name: Run integration tests with Testcontainers
  run: pnpm test:integration
  env:
    NODE_ENV: test
    NEXTAUTH_SECRET: test-secret-key
    NEXTAUTH_URL: http://localhost:3000
    TC_CLOUD_TOKEN: ${{ secrets.TESTCONTAINERS_CLOUD_TOKEN }}
```

### 4. Local Development

For local development, Testcontainers will use Docker Desktop or local Docker installation:

```bash
# Run unit tests (no containers needed)
pnpm test:unit

# Run integration tests (uses local Docker)
pnpm test:integration

# Run all tests
pnpm test:all
```

## Test Structure

### Integration Tests

Integration tests are located in `src/__tests__/integration/` and use Testcontainers to:

- Create isolated PostgreSQL containers for each test
- Run database migrations automatically
- Clean up containers after tests complete

### Test Configuration

- **Unit Tests**: `jest.config.js` - Fast tests without containers
- **Integration Tests**: `jest.config.testcontainers.js` - Tests with real database containers

### Test Utilities

The `src/__tests__/integration/helpers/` directory contains:

- `testcontainers-setup.ts` - Manages container lifecycle
- `test-utils.ts` - Helper functions for creating test data
- `global-setup.ts` - Global test environment setup
- `global-teardown.ts` - Global test environment cleanup

## Benefits

1. **Isolation**: Each test gets a fresh database instance
2. **Reliability**: No shared state between tests
3. **Speed**: Parallel test execution with managed containers
4. **CI/CD Friendly**: No Docker-in-Docker complexity
5. **Real Database**: Tests against actual PostgreSQL, not mocks

## Troubleshooting

### Common Issues

1. **Container Startup Timeout**
   - Increase timeout in `jest.config.testcontainers.js`
   - Check network connectivity

2. **Migration Failures**
   - Ensure Prisma schema is up to date
   - Check migration files are present

3. **Memory Issues**
   - Reduce number of concurrent tests
   - Increase GitHub Actions runner memory

### Debug Mode

To run tests with debug output:

```bash
DEBUG=testcontainers:* pnpm test:integration
```

### Local Docker Issues

If local Docker isn't working:

```bash
# Check Docker status
docker info

# Restart Docker Desktop
# Or restart Docker daemon on Linux
sudo systemctl restart docker
```

## Monitoring

Testcontainers Cloud provides:

- Container usage metrics
- Performance analytics
- Cost tracking
- Usage limits and quotas

Monitor your usage at [Testcontainers Cloud Dashboard](https://app.testcontainers.cloud/).

## Security

- API tokens are stored as GitHub secrets
- Containers are isolated and ephemeral
- No persistent data is stored in cloud containers
- All containers are destroyed after tests complete

## Cost Considerations

Testcontainers Cloud offers:

- Free tier for open source projects
- Pay-per-use pricing for commercial projects
- Usage-based billing
- Cost optimization recommendations

Check the [pricing page](https://testcontainers.com/cloud/pricing/) for current rates. 