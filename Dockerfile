# Production Dockerfile
FROM node:18-alpine AS base

# Install pnpm and OpenSSL dependencies for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Set Prisma to use OpenSSL 3.x for Alpine compatibility
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_QUERY_ENGINE_BINARY=linux-musl-openssl-3.0.x

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Copy Prisma client to a location that won't be excluded by .dockerignore
RUN find node_modules -name ".prisma" -type d | head -1 | xargs -I {} cp -r {} /tmp/prisma-client || \
    (echo "Prisma client not found in node_modules" && \
     echo "Checking for Prisma client in .pnpm directories..." && \
     find node_modules/.pnpm -name ".prisma" -type d | head -1 | xargs -I {} cp -r {} /tmp/prisma-client || \
     (echo "Prisma client still not found" && find node_modules -name "*prisma*" -type d && exit 1))

# Production stage
FROM node:18-alpine AS production

# Install pnpm and OpenSSL dependencies for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Set Prisma to use OpenSSL 3.x for Alpine compatibility
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_QUERY_ENGINE_BINARY=linux-musl-openssl-3.0.x

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema
COPY prisma ./prisma

# Temporarily disable postinstall script
RUN npm pkg delete scripts.postinstall

# Install production dependencies plus necessary runtime tools
RUN pnpm install --frozen-lockfile --prod && pnpm add -D prisma tsx

# Copy generated Prisma client from build stage
COPY --from=base /tmp/prisma-client ./node_modules/.prisma

# Copy built application
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.js ./

# Copy setup script
COPY scripts/setup-prod.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the application with database setup
CMD ["sh", "-c", "node setup-prod.js && pnpm start"] 