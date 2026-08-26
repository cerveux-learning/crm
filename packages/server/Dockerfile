# Multi-stage Dockerfile for Server (API REST + Prisma ORM)
# Stage 1: Build TypeScript and Prisma Client
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root manifest and workspace package definitions
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/server/prisma packages/server/prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client for build
RUN npm run db:generate --workspace=@crm/server

# Copy source files
COPY packages/shared/ packages/shared/
COPY packages/server/src packages/server/src/
COPY packages/server/tsconfig.json packages/server/

# Compile TypeScript for shared and server packages
RUN npm run build --workspace=@crm/shared
RUN npm run build --workspace=@crm/server

# Stage 2: Production runtime image
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests for production dependency install
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/server/prisma packages/server/prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma client engine for the production image
RUN npx prisma generate --schema=packages/server/prisma/schema.prisma

# Copy compiled code from builder stage
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/server/dist packages/server/dist

# Copy startup entrypoint script
COPY packages/server/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "packages/server/dist/index.js"]
