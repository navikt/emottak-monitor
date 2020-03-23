package no.nav.emottak

import io.ktor.util.KtorExperimentalAPI
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import no.nav.emottak.util.getFileAsString
import no.nav.syfo.db.Database
import no.nav.syfo.services.MessageQueryService
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakAdmin")

@KtorExperimentalAPI
fun main() {
    val environment = Environment()

    val databaseVaultSecrets = VaultCredentials(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username")
    )

    val database = Database(environment, databaseVaultSecrets)

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(environment, applicationState)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()

    val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    val messageInfo = messageQueryService.hentMeldinger()

    log.info("Henter ut den første mottakiden info: ${messageInfo.firstOrNull()?.mottakid}")

    applicationState.ready = true
}
