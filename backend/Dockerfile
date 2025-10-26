# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 4200
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main.js"]
