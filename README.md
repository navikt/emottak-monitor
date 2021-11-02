![Deploy to dev and prod](https://github.com/navikt/emottak-monitor/workflows/Deploy%20to%20dev%20and%20prod/badge.svg?branch=master)
# emottak-monitor
Application for getting out messages from emottak database

## Technologies used
* Kotlin
* Ktor
* Gradle
* Azure

#### Requirements

* JDK 12


#### Build and run tests
To build locally and run the integration tests you can simply run `./gradlew shadowJar` or on windows 
`gradlew.bat shadowJar`

#### Creating a docker image
Creating a docker image should be as simple as `docker build -t emottak-monitor .`

#### Running a docker image
`docker run --rm -it -p 8080:8080 emottak-monitor`

## Contact us
### Code/project related questions can be sent to
* Nabil Fario, `nabil.fario@nav.no`



### For NAV employees
We are available at the Slack channel #team-emottak 
