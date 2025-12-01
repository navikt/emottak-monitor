FROM gcr.io/distroless/java21
COPY build/libs/*all.jar ./app.jar
#ENV JAVA_OPTS="-Dlogback.configurationFile=logback-remote.xml"
USER nonroot
#CMD ["/bin/sh", "-c", "java $JAVA_OPTS -jar app.jar"]
ENTRYPOINT ["java", "-Dlogback.configurationFile=logback-remote.xml", "-jar", "./app.jar"]