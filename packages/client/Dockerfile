# Multi-stage Dockerfile for Client (SPA)
# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifest and configs for workspace dependency resolution
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/client/package.json packages/client/

# Install dependencies for all workspace packages
RUN npm ci

# Copy source code of shared and client packages
COPY packages/shared/ packages/shared/
COPY packages/client/ packages/client/

# Build shared library first, then build client SPA
RUN npm run build --workspace=@crm/shared
RUN npm run build --workspace=@crm/client

# Stage 2: Serve with lightweight Nginx web server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built production assets from builder stage
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
