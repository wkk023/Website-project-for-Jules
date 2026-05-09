# Stage 1: Build stage
FROM node:24-slim AS builder

RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build frontend and server
# package.json defines "build": "vite build --outDir dist/public && esbuild ..."
RUN pnpm run build

# EXPLICIT VERIFICATION of build output in builder stage
RUN ls -la /app/dist && ls -la /app/dist/public && [ -f /app/dist/public/index.html ]

# Stage 2: Runtime stage
FROM node:24-slim

WORKDIR /app

# Copy dependency files for production install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy the ENTIRE dist folder containing both the server bundle and the public assets
COPY --from=builder /app/dist ./dist

# Copy assets
COPY --from=builder /app/server/buildings_new.csv ./server/buildings_new.csv

# Install ONLY production dependencies
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile && \
    npm uninstall -g pnpm

# FINAL VERIFICATION in the runtime stage
RUN ls -la /app/dist && ls -la /app/dist/public

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
