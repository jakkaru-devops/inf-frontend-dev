FROM node:18.12-slim as production

WORKDIR /usr/src/app


RUN apt-get update


COPY package.json ./


COPY .env ./


RUN yarn install --production=true


COPY . .


RUN yarn build

CMD ["yarn", "start"]
