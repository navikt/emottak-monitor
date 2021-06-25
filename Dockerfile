FROM navikt/node-express:12.2.0-alpine

RUN apk --no-cache add curl
ADD ./ /var/server/
RUN yarn
RUN yarn install
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]