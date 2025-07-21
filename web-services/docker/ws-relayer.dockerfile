FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY apps/ws-relayer .

RUN bun install --verbose

EXPOSE 9093

CMD ["bun", "run", "index.ts"]