# ---------- builder ----------
FROM oven/bun:alpine AS builder

RUN apk add --no-cache openssl-dev build-base python3

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY packages ./packages
COPY apps/depin-ws-relayer/package.json ./apps/depin-ws-relayer/
RUN bun install

# Copy source and build
COPY apps/depin-ws-relayer ./apps/depin-ws-relayer
RUN bun run prisma:generate

# Build the application
RUN cd apps/depin-ws-relayer && bun build index.ts --outdir dist --target bun --minify

# Install production dependencies
RUN rm -rf node_modules && bun install --production

# Clean up unnecessary files
RUN find node_modules -name "*.md" -delete \
  && find node_modules -name "*.txt" -delete \
  && find node_modules -name "*.map" -delete \
  && find node_modules -name "test*" -type d -exec rm -rf {} + \
  && find node_modules -name "docs" -type d -exec rm -rf {} + \
  && find node_modules -name "examples" -type d -exec rm -rf {} +

# ---------- runtime ----------
FROM oven/bun:alpine AS runtime

RUN addgroup -g 1001 -S nodejs \
  && adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs nodejs

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/depin-ws-relayer/dist ./apps/depin-ws-relayer/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/depin-ws-relayer/package.json ./apps/depin-ws-relayer/package.json
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 8080

# Run the built JavaScript file directly
CMD ["bun", "run", "./apps/depin-ws-relayer/dist/index.js"]