FROM node:24-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY src/ src/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

RUN pnpm run build

RUN pnpm prune --prod


FROM node:24-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["node", "dist/src/main.js"]
