FROM node:20-alpine
WORKDIR /usr/src/app
COPY server server/
COPY build build/

WORKDIR /usr/src/app/server
RUN yarn
RUN yarn global add ts-node@10.9.2 typescript@5.9.2 '@types/node@20.19.10'

ENV PORT=8080
EXPOSE $PORT

CMD ["ts-node", "server.ts"]
