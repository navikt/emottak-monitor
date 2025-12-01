FROM gcr.io/distroless/java21
COPY build/libs/*all.jar ./app.jar
USER nonroot
ENTRYPOINT ["java", "-Dlogback.configurationFile=logback-remote.xml", "-jar", "./app.jar"]