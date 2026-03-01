# -stage1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# -stage2: Server with Nginx

FROM nginx:alpine

#copy the builder react files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

#copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
