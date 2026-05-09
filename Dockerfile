# Stage 1: Build stage
FROM node:24-slim AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
# This runs 'vite build --outDir dist/public' and 'esbuild server/_core/index.ts ... --outdir=dist'
RUN pnpm run build && ls -R dist

# Stage 2: Runtime stage
FROM node:24-slim

WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
# Copy the entire dist folder which contains index.js AND the public subfolder
COPY --from=builder /app/dist ./dist
# Copy assets
COPY --from=builder /app/server/buildings_new.csv ./server/buildings_new.csv

# Install ONLY production dependencies
# Since we moved vite plugins to dependencies, they will be installed here
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile && \
    npm uninstall -g pnpm

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the application using node directly
CMD ["node", "dist/index.js"]
