# frontend/Dockerfile
# Stage 1: Build Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pastikan base path Vite default (/) atau atur sesuai kebutuhan
RUN npm run build

# Stage 2: Nginx untuk serve static + reverse proxy
FROM nginx:1.27-alpine
# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy hasil build Vite
COPY --from=builder /app/dist /usr/share/nginx/html
# Non-root optional: (nginx image sudah handle)
EXPOSE 80
