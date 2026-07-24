FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci && cd backend && npm ci

COPY . .
COPY backend ./backend

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist

WORKDIR /app/backend
RUN npm ci --omit=dev

EXPOSE 3001

CMD ["node", "server.js"]