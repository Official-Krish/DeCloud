FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json .
COPY bun.lock .

COPY packages ./packages
COPY apps/backend ./apps/backend

RUN bun install --verbose
RUN bun run prisma:generate

EXPOSE 3000
CMD ["bun", "run", "backend"]