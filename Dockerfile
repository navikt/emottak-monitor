#FROM node:16 as build-step

#WORKDIR /usr/src/app
#COPY package.json yarn.lock ./

#RUN yarn install

#COPY . .
#RUN yarn build


FROM node:16

WORKDIR /usr/src/app
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
