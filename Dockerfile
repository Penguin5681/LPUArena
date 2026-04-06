# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Cloud Run sets PORT dynamically; default to 8080 for local runs.
ENV PORT=8080

# Replace default nginx site and add runtime template + entrypoint.
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Static assets from Vite build output.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
