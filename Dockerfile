# syntax=docker/dockerfile:1

FROM node:22-alpine

RUN apk add --no-cache openssl wget

RUN npm install -g pnpm@11.6.0

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0
ENV PORT=3333

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN pnpm db:generate
RUN pnpm build

RUN chmod +x docker-entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["node", "dist/server.js"]