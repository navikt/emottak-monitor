FROM node:16.6.2-alpine

WORKDIR /usr/src/app
COPY server server/
COPY build build/

WORKDIR /usr/src/app/server
RUN npm install
RUN npm install -g ts-node typescript '@types/node'

ENV PORT 8080
EXPOSE $PORT

CMD ["ts-node", "server.ts"]
