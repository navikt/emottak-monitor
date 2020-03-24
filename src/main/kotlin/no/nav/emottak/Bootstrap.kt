package no.nav.emottak

import io.ktor.util.InternalAPI
import io.ktor.util.KtorExperimentalAPI
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakAdmin")

@InternalAPI
@KtorExperimentalAPI
fun main() {
    val environment = Environment()

    /*
    val databaseVaultSecrets = VaultCredentials(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username")
    )
    val database = Database(environment, databaseVaultSecrets)
    */

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(environment, applicationState)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()

    applicationState.ready = true

    /*
    log.info("Starter med å kjøre dabasespørring")
    val messageQueryService = MessageQueryService(database, environment.databasePrefix)
    val meldinger = messageQueryService.hentMeldinger(fom, tom)
    log.info("Hentet ut den første mottakiden info: ${meldinger.firstOrNull()?.mottakid}")
    */
}
