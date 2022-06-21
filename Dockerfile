FROM node:16.15.1-alpine
WORKDIR /usr/src/app
COPY server server/
COPY build build/

WORKDIR /usr/src/app/server
RUN yarn
RUN yarn global add ts-node typescript '@types/node'

ENV PORT 8080
EXPOSE $PORT

CMD ["ts-node", "server.ts"]
