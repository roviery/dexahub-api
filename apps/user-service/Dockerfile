FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm ci
COPY apps/user-service ./apps/user-service
COPY libs ./libs
RUN npx nest build user-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/user-service ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/apps/user-service/src/main"]
