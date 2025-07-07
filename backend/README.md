![Deploy to dev and prod](https://github.com/navikt/emottak-monitor/workflows/Deploy%20to%20dev%20and%20prod/badge.svg?branch=master)
![GitHub issues](https://img.shields.io/github/issues-raw/navikt/emottak-monitor)
![GitHub](https://img.shields.io/github/license/navikt/emottak-monitor)

# emottak-monitor

Application for getting out messages from emottak database

**Technologies used:**

* Kotlin
* Ktor
* Gradle
* Azure
* Oracle
* Spek
* JDK


## Development

### Prerequisites

Make sure you have the Java JDK 21 installed
You can check which version you have installed using this command:
`java -version`

#### In IntelliJ 

Make sure you set Gradle version to 21:
```
File > Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JVM.
```

> **FAILURE: Build failed with an exception**  
> 
> If you are using the wrong Gradle JVM, you will get an error like this:
> 
> ```
> Starting Gradle Daemon...
> Gradle Daemon started in 519 ms
> 
> FAILURE: Build failed with an exception.
> 
> * What went wrong:
> A problem occurred configuring root project 'emottak-monitor'.
> > Could not resolve all files for configuration ':classpath'.
> 
> (omitted)
> ```

## Running application locally

### Running the unit tests

To run the unit tests just run this command:
`./gradlew test` or on windows `gradlew.bat test`

### Building and run the application

To build locally and run the integration tests you can simply run `./gradlew clean` build or on windows `gradlew.bat clean build`

### Build the jar

To build the jar file run `./gradlew shadowJar` or on windows `gradlew.bat shadowJar`

### Creating a docker image

Creating a docker image should be as simple as `docker build -t emottak-monitor .`

### Running a docker image

`docker run --rm -it -p 8080:8080 emottak-monitor`

### Upgrading the gradle wrapper

Find the newest version of gradle here: https://gradle.org/releases/ Then run this command:

```./gradlew wrapper --gradle-version $gradleVersjon```

Remeber to also update the gradle version in the build.gradle.kts file
```gradleVersion = "$gradleVersjon"```

## Inquiries

Questions related to the code or project can be asked as issues here on GitHub.

## For NAV employees

We are available at the Slack channel #emottak 
