FROM node:22-alpine AS build

ENV DATABASE_URL="postgresql://user:password@localhost:5432/mind_bloom"

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine

ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://user:password@localhost:5432/mind_bloom"

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate
COPY --from=build /app/build ./build

COPY ./bin/app.sh ./app.sh
COPY ./bin/analyze.sh ./analyze.sh
COPY ./bin/collect.sh ./collect.sh

ENTRYPOINT [ "./app.sh" ]
