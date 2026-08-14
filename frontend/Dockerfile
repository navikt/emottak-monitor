FROM node:22-alpine
WORKDIR /usr/src/app
COPY server server/
COPY build build/

WORKDIR /usr/src/app/server
RUN yarn
RUN yarn global add tsx typescript @types/node

ENV PORT=8080
EXPOSE $PORT

CMD ["tsx", "server.ts"]
