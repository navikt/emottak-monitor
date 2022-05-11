![Deploy to dev and prod](https://github.com/navikt/emottak-monitor/workflows/Deploy%20to%20dev%20and%20prod/badge.svg?branch=master)
# emottak-monitor
Application for getting out messages from emottak database

## Technologies used
* Kotlin
* Ktor
* Gradle
* Azure
* Oracle

#### Requirements

* JDK 17

## Running application locally

### Building and run the application
To build locally and run the integration tests you can simply run `./gradlew clean` build or on windows `gradlew.bat clean build`

#### Build the jar
To build the jar file run `./gradlew shadowJar` or on windows `gradlew.bat shadowJar`

#### Creating a docker image
Creating a docker image should be as simple as `docker build -t emottak-monitor .`

#### Running a docker image
`docker run --rm -it -p 8080:8080 emottak-monitor`

## Upgrading the gradle wrapper
Find the newest version of gradle here: https://gradle.org/releases/ Then run this command: 

```./gradlew wrapper --gradle-version $gradleVersjon```

Remeber to also update the gradle version in the build.gradle.kts file
```gradleVersion = "$gradleVersjon"```

## Henvendelser
Questions related to the code or project can be asked as issues here on GitHub.

## For NAV employees
We are available at the Slack channel #team-emottak 
