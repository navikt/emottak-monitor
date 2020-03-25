package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.util.InternalAPI
import io.ktor.util.KtorExperimentalAPI
import java.net.URL
import java.util.concurrent.TimeUnit
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import no.nav.emottak.db.Database
import no.nav.emottak.services.MessageQueryService
import no.nav.emottak.util.getFileAsString
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakAdmin")

@InternalAPI
@KtorExperimentalAPI
fun main() {
    val environment = Environment()

    val jwkProvider = JwkProviderBuilder(URL(environment.jwkKeysUrl))
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    val databaseVaultSecrets = VaultCredentials(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username")
    )

    val database = Database(environment, databaseVaultSecrets)
    val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(environment, applicationState, jwkProvider, messageQueryService)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()
    applicationState.ready = true
}
