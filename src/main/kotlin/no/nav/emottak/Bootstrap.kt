package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.ktor.util.KtorExperimentalAPI
import java.net.URL
import java.nio.file.Paths
import java.util.concurrent.TimeUnit
import no.nav.emottak.application.ApplicationServer
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.createApplicationEngine
import no.nav.emottak.db.Database
import no.nav.emottak.services.MessageQueryService
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val objectMapper: ObjectMapper = ObjectMapper().apply {
    registerKotlinModule()
    registerModule(JavaTimeModule())
    configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
}

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.henteMeldinger")

@KtorExperimentalAPI
fun main() {
    val environment = Environment()

    val jwkProvider = JwkProviderBuilder(URL(environment.jwkKeysUrl))
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build()

    val vaultSecrets = objectMapper.readValue<VaultCredentials>(Paths.get("/var/run/secrets/nais.io/vault/credentials.json").toFile())

    val applicationState = ApplicationState()

    val database = Database(environment, vaultSecrets)

    val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    log.debug("Henter meldinger fra database : ${messageQueryService.hentMeldinger()}")

    val applicationEngine = createApplicationEngine(environment, applicationState, jwkProvider, messageQueryService)
    val applicationServer = ApplicationServer(applicationEngine, applicationState)

    applicationServer.start()

    applicationState.ready = true
}
