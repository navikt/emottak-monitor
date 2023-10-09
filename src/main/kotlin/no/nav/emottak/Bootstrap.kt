package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.util.InternalAPI
import io.prometheus.client.Counter
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import no.nav.emottak.application.getWellKnown
import no.nav.emottak.db.Database
import no.nav.emottak.services.MessageQueryService
import no.nav.emottak.util.getFileAsString
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.net.URL
import java.util.concurrent.TimeUnit

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakMonitor")

@InternalAPI
fun main() {
    val environment = Environment()

    val vaultSecrets = VaultSecrets(
        databasePassword = getFileAsString("/secrets/emottak-monitor/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-monitor/credentials/username"),
    )

    val wellKnown = getWellKnown(environment.oidcWellKnownUriUrl)
    log.info("WellKnown is ok")
    val jwkProvider = JwkProviderBuilder(URL(wellKnown.jwks_uri))
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    val database = Database(environment, vaultSecrets)
    log.info("Database is ok")
    val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    val applicationState = ApplicationState()

    val applicationEngine = createApplicationEngine(
        environment,
        applicationState,
        jwkProvider,
        wellKnown.issuer,
        messageQueryService,
    )
    val applicationServer = ApplicationServer(applicationEngine, applicationState)
    val hentmeldingerCounter: Counter =
        Counter.build()
            .namespace("emottak_monitor")
            .name("hentmeldinger_count")
            .help("Counts the number of api calls to hentmeldinger")
            .register()

        hentmeldingerCounter.inc()

    applicationServer.start()
}
