# Stage 1: Builder
FROM node:24-slim AS builder

RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Copy all source
COPY . .

# Build both frontend and backend using the safer command
RUN mkdir -p dist/public && \
    npx vite build --outDir dist/public --emptyOutDir false && \
    npx esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Explicitly check build output location
RUN ls -R /app/dist

# Stage 2: Runner
FROM node:24-slim

WORKDIR /app

# Copy dependency files for production install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy the ENTIRE dist folder relative to WORKDIR
COPY --from=builder /app/dist ./dist

# Copy assets
COPY --from=builder /app/server/buildings_new.csv ./server/buildings_new.csv

# Install production dependencies
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile && \
    npm uninstall -g pnpm

# FINAL IMAGE VERIFICATION: Confirm the assets landed in the right spot
RUN ls -la /app/dist && ls -la /app/dist/public && [ -f /app/dist/public/index.html ]

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# The compiled server entry point
CMD ["node", "dist/index.js"]
