FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json .
COPY bun.lock .

COPY packages ./packages
COPY apps/depin-ws-relayer ./apps/depin-ws-relayer

RUN bun install --verbose
RUN bun run prisma:generate

EXPOSE 8080
CMD ["bun", "run", "depin-ws-relayer"]