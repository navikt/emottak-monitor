#FROM node:16 as build-step

#WORKDIR /usr/src/app
#COPY package.json yarn.lock ./

#RUN yarn install

#COPY . .
#RUN yarn build


FROM navikt/node-express:16

USER root
RUN apk --no-cache add curl

COPY . /var/server

RUN yarn

EXPOSE 3000

CMD ["yarn", "start"]
