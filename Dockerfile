# Stage 1 - build app
FROM navikt/node-express:16 as build-step

WORKDIR /app
USER root

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

# Stage 2 - final image
FROM nginx:1-alpine

COPY --from=build-step /app/build/ /usr/share/nginx/html
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY /nginx/gzip.conf /etc/nginx/gzip.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
