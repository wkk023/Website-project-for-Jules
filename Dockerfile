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
RUN npx vite build --outDir dist/public && \
    npx esbuild server/_core/index.ts --platform=node --bundle --format=esm --outfile=dist/index.js

# Verification in Builder: Use find to see the exact structure
RUN find dist -name index.html

# Stage 2: Runner
FROM node:24-slim

WORKDIR /app

# Copy dependency files for production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy the ENTIRE dist folder.
# Using /app/dist to /app/dist explicitly ensures no nesting occurs.
COPY --from=builder /app/dist /app/dist

# Copy assets
COPY --from=builder /app/server/buildings_new.csv /app/server/buildings_new.csv

# Install production dependencies
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile && \
    npm uninstall -g pnpm

# FINAL IMAGE VERIFICATION: Use find to be path-agnostic but confirm existence
RUN find /app/dist -name index.html && \
    ls -la /app/dist/index.js

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# The compiled server entry point
CMD ["node", "dist/index.js"]
