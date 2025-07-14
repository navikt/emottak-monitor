FROM gcr.io/distroless/java21
COPY build/libs/*all.jar ./app.jar
ENV JAVA_OPTS="-Dlogback.configurationFile=logback-remote.xml"
USER nonroot
CMD [ "app.jar" ]