FROM gcr.io/distroless/java21
COPY build/libs/*all.jar ./app.jar
USER nonroot
CMD [ "app.jar" ]