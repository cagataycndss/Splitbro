# splitbro-mobile/Dockerfile
# Expo uygulamasını web olarak export edip Nginx ile servis eder.

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları önce kopyala (Docker cache için)
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Web export için gerekli bağımlılıkları yükle
RUN npx -y expo install react-dom react-native-web

# Uygulama kaynak kodunu kopyala
COPY . .

# Expo web export (statik dosyalar üretir)
RUN npx expo export --platform web

# ---- Stage 2: Serve ----
FROM nginx:alpine

# SPA routing: tüm route'ları index.html'e yönlendir
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Cache static assets aggressively \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 30d; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Build çıktısını Nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
