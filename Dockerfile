FROM navikt/node-express:14-alpine

USER root
RUN apk --no-cache add curl
ADD ./ /var/server/
RUN yarn
RUN yarn install
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]