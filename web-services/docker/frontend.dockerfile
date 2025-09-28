# ---- Stage 1: Build the React app ----
FROM node:20 AS builder

WORKDIR /app

COPY apps/frontend/package*.json ./

RUN npm install --legacy-peer-deps --verbose

COPY apps/frontend/ ./

RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
