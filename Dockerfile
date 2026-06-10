## Stage 1 : build React
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npm run build

## Stage 2 : serve avec nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA fallback : toutes les routes React vers index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
