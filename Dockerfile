# Stage 1: Build
FROM node:18.12-slim as build

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2: Production
FROM node:18.12-slim as production

WORKDIR /usr/src/app

RUN apt-get update

COPY package.json ./
COPY .env ./

RUN yarn install --production=true

COPY --from=build /usr/src/app/dist ./dist

CMD ["yarn", "start"]
