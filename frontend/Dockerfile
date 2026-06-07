# --- Build stage ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL is baked in at build time. Default is empty → the SPA makes
# same-origin relative calls ("/api/...") that nginx reverse-proxies to the
# backend. Only override (e.g. http://localhost:8000) to point the browser
# directly at a backend instead of going through the proxy.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- Serve stage ---
# Unprivileged nginx: listens on 8080 and keeps its pid in /tmp, so it runs
# under OpenShift's restricted SCC (a random non-root UID). Same envsubst
# entrypoint as the stock image, so ${BACKEND_URL} templating still works.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Where nginx forwards /api/ at runtime; substituted into the config on startup,
# so it can be changed per environment (compose / OpenShift) without rebuilding.
ENV BACKEND_URL=http://backend:8000

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# OpenShift runs the container as an arbitrary UID that always belongs to group
# 0. Make the dirs nginx writes to (cache temp dirs, the envsubst output) owned
# by group 0 and group-writable so that UID can use them.
USER root
RUN chgrp -R 0 /var/cache/nginx /etc/nginx/conf.d \
 && chmod -R g=u /var/cache/nginx /etc/nginx/conf.d
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
