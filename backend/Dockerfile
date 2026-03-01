# -stage1: Build
FROM node:18-alpine AS  builder
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# -stage2: Run

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY package*.json ./


USER node

EXPOSE 5000


CMD ["node", "src/index.js"]
