FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY web-services/apps/backend ./apps/backend
COPY web-services/packages ./packages

COPY web-services/bun.lock ./
COPY web-services/package.json ./

RUN bun install

RUN bun run prisma:generate

EXPOSE 3000

CMD ["bun", "run", "backend"]