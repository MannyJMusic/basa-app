# Production Dockerfile
FROM node:18-alpine AS base

# Install pnpm and OpenSSL dependencies for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema first (needed for postinstall script)
COPY prisma ./prisma

# Set Prisma to use OpenSSL 3.x for Alpine compatibility
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_QUERY_ENGINE_BINARY=linux-musl-openssl-3.0.x

# Install dependencies (postinstall will now find the schema)
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm and OpenSSL dependencies for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema first (needed for postinstall script)
COPY prisma ./prisma

# Set Prisma to use OpenSSL 3.x for Alpine compatibility
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_QUERY_ENGINE_BINARY=linux-musl-openssl-3.0.x

# Install all dependencies first (including devDependencies for postinstall script)
RUN pnpm install --frozen-lockfile

# Manually run prisma generate to ensure it's done before pruning
RUN pnpm prisma generate

# Temporarily disable postinstall script to avoid it running during prune
RUN npm pkg delete scripts.postinstall

# Remove devDependencies to keep production image lean
RUN pnpm prune --prod

# Copy prisma generated client
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"] 