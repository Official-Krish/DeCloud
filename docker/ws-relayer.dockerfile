FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY web-services/apps/ws-relayer ./apps/ws-relayer
COPY web-services/packages ./packages

COPY web-services/bun.lock ./
COPY web-services/package.json ./

RUN bun install
RUN bun run prisma:generate

EXPOSE 9093

CMD ["bun", "run", "ws-relayer"]