FROM oven/bun:latest

# Set the working directory
WORKDIR /app

COPY bun.lock .
COPY apps/frontend .

RUN bun install --verbose

EXPOSE 5173

CMD ["bun", "run", "dev"]