![Deploy to dev and prod](https://github.com/navikt/emottak-admin/workflows/Deploy%20to%20dev%20and%20prod/badge.svg?branch=master)
# emottak-admin
Application for getting out messages from emottak database

## Technologies used
* Kotlin
* Ktor
* Gradle

#### Requirements

* JDK 12

## Getting started
#### Running locally
`./gradlew run`


#### Build and run tests
To build locally and run the integration tests you can simply run `./gradlew shadowJar` or on windows 
`gradlew.bat shadowJar`

#### Creating a docker image
Creating a docker image should be as simple as `docker build -t emottak-admin .`

#### Running a docker image
`docker run --rm -it -p 8080:8080 emottak-admin`

## Contact us
### Code/project related questions can be sent to
* Nabil Fario, `nabil.fario@nav.no`


### For NAV employees
We are available at the Slack channel #integrasjon