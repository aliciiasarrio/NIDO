# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors first for Docker cache optimization
COPY package*.json ./
RUN npm ci

# Copy project source and build production bundle
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Runtime Stage (Nginx Alpine)
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built browser bundle from builder stage
COPY --from=builder /app/dist/nido-frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
