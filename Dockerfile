# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

RUN apk add --no-cache openssl wget libc6-compat

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

RUN pnpm db:generate
RUN pnpm build

FROM base AS production

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=5 \
  CMD wget -qO- http://localhost:3333/api/v1/health/ready || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]

FROM deps AS development

ENV NODE_ENV=development
ENV PORT=3333
ENV HOST=0.0.0.0

COPY prisma ./prisma
COPY tsconfig.json ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN pnpm db:generate \
  && sed -i 's/\r$//' docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "dev"]
