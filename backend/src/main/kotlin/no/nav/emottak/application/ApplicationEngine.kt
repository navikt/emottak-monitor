package no.nav.emottak.application

import com.auth0.jwk.JwkProvider
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.ktor.client.HttpClient
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.netty.NettyApplicationEngine
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.path
import io.ktor.server.response.respond
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.Environment
import no.nav.emottak.application.api.hentCpa
import no.nav.emottak.application.api.hentCpaIdInfo
import no.nav.emottak.application.api.hentCpaIdInfoEbms
import no.nav.emottak.application.api.hentEbMessageIdInfo
import no.nav.emottak.application.api.hentFeilstatistikk
import no.nav.emottak.application.api.hentHendelser
import no.nav.emottak.application.api.hentHendelserEbms
import no.nav.emottak.application.api.hentLogg
import no.nav.emottak.application.api.hentLoggEbms
import no.nav.emottak.application.api.hentMeldinger
import no.nav.emottak.application.api.hentMeldingerEbms
import no.nav.emottak.application.api.hentMessageInfo
import no.nav.emottak.application.api.hentMessageInfoEbms
import no.nav.emottak.application.api.hentPartnerIdInfo
import no.nav.emottak.application.api.hentRollerServicesAction
import no.nav.emottak.application.api.hentSistBrukt
import no.nav.emottak.application.api.registerNaisApi
import no.nav.emottak.services.MessageQueryService
import org.slf4j.event.Level

@InternalAPI
fun createApplicationEngine(
    env: Environment,
    applicationState: ApplicationState,
    jwkProvider: JwkProvider,
    issuer: String,
    meldingService: MessageQueryService,
    scopedAuthHttpClient: HttpClient,
): EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration> =
    embeddedServer(Netty, env.applicationPort) {
        serverSetup(env, jwkProvider, issuer, applicationState, meldingService, scopedAuthHttpClient)
    }

@InternalAPI
private fun Application.serverSetup(
    env: Environment,
    jwkProvider: JwkProvider,
    issuer: String,
    applicationState: ApplicationState,
    meldingService: MessageQueryService,
    scopedAuthHttpClient: HttpClient,
) {
    setupAuth(env, jwkProvider, issuer)
    install(ContentNegotiation) {
        jackson {
            registerKotlinModule()
            registerModule(JavaTimeModule())
            configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
            configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        }
    }
    install(CallLogging) {
        level = Level.INFO
        filter { call ->
            call.request.path().startsWith("/v1")
        }
    }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(HttpStatusCode.InternalServerError, cause.message ?: "Unknown error")

            no.nav.emottak.log
                .error("Caught exception", cause)
            throw cause
        }
    }
    install(CORS) {
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Options)
        allowHeader("Content-Type")
        allowHost(env.emottakFrontEndUrl, schemes = listOf("https", "https"))
        allowCredentials = true
    }
    routing {
        registerNaisApi(applicationState)
        authenticate("jwt") {
            route("/v1") {
                hentMeldinger(meldingService)
                hentMeldingerEbms(scopedAuthHttpClient)
                hentHendelser(meldingService)
                hentHendelserEbms(scopedAuthHttpClient)
                hentLogg(meldingService)
                hentLoggEbms(scopedAuthHttpClient)
                hentCpa(meldingService)
                hentMessageInfo(meldingService)
                hentMessageInfoEbms(scopedAuthHttpClient)
                hentCpaIdInfo(meldingService)
                hentCpaIdInfoEbms(scopedAuthHttpClient)
                hentEbMessageIdInfo(meldingService)
                hentPartnerIdInfo(meldingService)
                hentFeilstatistikk(meldingService)
                hentRollerServicesAction(scopedAuthHttpClient)
                hentSistBrukt(meldingService, scopedAuthHttpClient)
            }
        }
    }
}
