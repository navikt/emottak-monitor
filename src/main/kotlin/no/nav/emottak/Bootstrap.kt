package no.nav.emottak

import io.ktor.util.KtorExperimentalAPI
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakAdmin")

@KtorExperimentalAPI
fun main() {
    val environment = Environment()

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(environment, applicationState)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()

    applicationState.ready = true

    log.info("Hello world")
}
