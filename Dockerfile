# Stage 1: Build stage
FROM node:24-slim AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches if they exist

# Install all dependencies (including devDependencies for build)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
# This runs 'vite build' and 'esbuild' for the server as defined in package.json
RUN pnpm run build

# Stage 2: Runtime stage
FROM node:24-slim

WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm install -g pnpm@10.4.1 && \
    pnpm install --prod --no-frozen-lockfile

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]
