[![Build status](https://github.com/navikt/behandler-elektronisk-kommunikasjon/workflows/Deploy%20to%20dev%20and%20prod/badge.svg)](https://github.com/navikt/behandler-elektronisk-kommunikasjon/workflows/Deploy%20to%20dev%20and%20prod/badge.svg)
# emottak-admin
Application for getting out messages from emottak database

## Technologies used
* Kotlin
* Ktor
* Gradle
* Spek
* Vault
* Oracle DB

#### Requirements

* JDK 11

## Getting started
#### Running locally
`./gradlew run`

## Add new clients to consume api
https://github.com/navikt/IaC/tree/master/Azure/registerApplication
And and then add clients in the list of authorizedUsers in the code

#### Build and run tests
To build locally and run the integration tests you can simply run `./gradlew shadowJar` or on windows 
`gradlew.bat shadowJar`

#### Creating a docker image
Creating a docker image should be as simple as `docker build -t emottak-admin .`

#### Running a docker image
`docker run --rm -it -p 8080:8080 behandler-elektronisk-kommunikasjon`

## Contact us
### Code/project related questions can be sent to
* Nabil Fario, `nabil.fario@nav.no`


### For NAV employees
We are available at the Slack channel .....