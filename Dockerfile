#FROM node:16 as build-step

#WORKDIR /usr/src/app
#COPY package.json yarn.lock ./

#RUN yarn install

#COPY . .
#RUN yarn build


FROM node:16.13

USER root
RUN apk --no-cache add curl

WORKDIR /usr/src/app
COPY . ./var/server

EXPOSE 3000

CMD ["yarn", "start"]
