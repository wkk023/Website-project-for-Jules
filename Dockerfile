# Stage 1: Builder
FROM node:24-slim AS builder

RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Copy all source
COPY . .

# Build frontend to dist/public and backend to dist/index.js
# Using --packages=external to prevent esbuild from trying to bundle binary files (.node)
RUN npx vite build --outDir dist/public && \
    npx esbuild server/_core/index.ts --platform=node --bundle --format=esm --packages=external --outfile=dist/index.js

# Verification in Builder
RUN find dist -name index.html

# Stage 2: Runner
FROM node:24-slim

WORKDIR /app

# Copy dependency files for production
COPY package.json pnpm-lock.yaml ./

# Copy the ENTIRE dist folder
COPY --from=builder /app/dist /app/dist

# Copy assets
COPY --from=builder /app/server/buildings_new.csv /app/server/buildings_new.csv

# Install production dependencies
# This is required because we used --packages=external
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile && \
    npm uninstall -g pnpm

# FINAL IMAGE VERIFICATION
RUN find /app/dist -name index.html && \
    ls -la /app/dist/index.js

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# The compiled server entry point
CMD ["node", "dist/index.js"]
