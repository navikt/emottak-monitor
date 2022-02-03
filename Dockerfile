# Stage 1 - build app
FROM navikt/node-express:16 as build-step

WORKDIR /app
USER root

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn build

# Stage 2 - final image
FROM nginxinc/nginx-unprivileged

COPY --from=build-step /app/build/ /usr/share/nginx/html
COPY /nginx/nginx.conf /etc/nginx/templates/default.conf.template
COPY /nginx/gzip.conf /etc/nginx/gzip.conf

USER root
RUN chown -R 1069:1069 /etc/nginx/conf.d/
USER 1069

CMD ["nginx", "-g", "daemon off;"]
