package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.util.InternalAPI
import io.ktor.util.KtorExperimentalAPI
import java.net.URL
import java.util.concurrent.TimeUnit
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import no.nav.emottak.application.getWellKnown
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

    val vaultSecrets = VaultSecrets(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username"),
        oidcWellKnownUri = getFileAsString(environment.oidcWellKnownUriPath),
        emottakAmdinClientId = getFileAsString(environment.emottakAdminClientIdPath)
    )

    val wellKnown = getWellKnown(vaultSecrets.oidcWellKnownUri)
    val jwkProvider = JwkProviderBuilder(URL(wellKnown.jwks_uri))
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    val database = Database(environment, vaultSecrets)
    val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(
        environment, applicationState, vaultSecrets,
        jwkProvider, wellKnown.issuer, messageQueryService)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()
    applicationState.ready = true
}
