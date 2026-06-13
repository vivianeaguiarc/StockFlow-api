# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

RUN apk add --no-cache openssl wget

RUN npm install -g pnpm@11.6.0

WORKDIR /app

# --- Dependencies ---
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV HUSKY=0

RUN pnpm install --frozen-lockfile --ignore-scripts

# --- Build ---
FROM deps AS build

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

ENV DATABASE_URL="postgresql://stockflow:stockflow@postgres:5432/stockflow_db?schema=public"

RUN pnpm db:generate
RUN pnpm build

# --- Production ---
FROM base AS runner

ENV NODE_ENV=production
ENV HUSKY=0
ENV PORT=3333

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN pnpm install --frozen-lockfile --prod --ignore-scripts \
  && npm install -g prisma@6.19.3 \
  && chmod +x docker-entrypoint.sh

COPY --from=build /app/dist ./dist

ENV DATABASE_URL="postgresql://stockflow:stockflow@postgres:5432/stockflow_db?schema=public"

RUN pnpm db:generate

EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
