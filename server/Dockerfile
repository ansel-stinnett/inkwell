# server/Dockerfile
#
# Copy package files and install dependencies before copying the source
# code, so Docker reuses the dependency layer when only source changes.

FROM node:22-alpine

ENV NODE_ENV=production
# error-handler.js hides internal error details only when NODE_ENV is
# production, so this is what activates that behaviour.

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma7.config.ts ./
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx --no-install prisma generate
# prisma7.config.ts reads DATABASE_URL and fails without it. generate does
# not connect to the database, so a throwaway URL is fine — it applies only
# to this RUN layer and never reaches the final image.

COPY src ./src
# Source last: it changes most often.

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV PORT=3000
EXPOSE 3000

USER node
# Run as the unprivileged "node" user from the official image.

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
# Secrets are never baked into the image — they arrive as environment
# variables at container start.
