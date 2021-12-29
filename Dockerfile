FROM navikt/node-express:16

USER root
ADD ./ /var/server/
RUN yarn
RUN yarn install
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]