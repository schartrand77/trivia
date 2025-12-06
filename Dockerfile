## Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# copy package manifests
COPY package.json package-lock.json* ./

# install deps (fallback to npm install if no lockfile)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# copy all files and build
COPY . .
RUN npm run build

## Production stage: nginx serves built files
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Create data directory for persistent storage (IndexedDB dumps, player data)
RUN mkdir -p /data && chmod 777 /data
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
