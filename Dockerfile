# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

RUN apk add --no-cache openssl wget libc6-compat \
  && addgroup -g 1001 -S stockflow \
  && adduser -S stockflow -u 1001 -G stockflow

WORKDIR /app

ENV HUSKY=0

RUN npm install -g pnpm@11.6.0

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN pnpm db:generate && pnpm build

FROM deps AS prod-deps

COPY prisma ./prisma

RUN pnpm db:generate \
  && pnpm prune --prod \
  && pnpm add prisma@6.9.0

FROM base AS production

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh \
  && chown -R stockflow:stockflow /app

USER stockflow

EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=5 \
  CMD wget -qO- http://localhost:3333/api/v1/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
