FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm ci
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs
RUN npx nest build api-gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p uploads/attendance
CMD ["node", "dist/apps/api-gateway/main"]
