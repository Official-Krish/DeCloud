FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

ARG DATABASE_URL

COPY package.json .
COPY bun.lock .

COPY packages/ ./packages

COPY apps/worker/ ./apps/worker

RUN bun install --verbose
RUN bun run prisma:generate

CMD ["bun", "run", "worker"]