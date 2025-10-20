package no.nav.emottak.application

import com.auth0.jwk.JwkProvider
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
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
import io.ktor.server.routing.routing
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.Environment
import no.nav.emottak.application.api.registerMeldingerApi
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
): EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration> =
    embeddedServer(Netty, env.applicationPort) {
        serverSetup(env, jwkProvider, issuer, applicationState, meldingService)
    }

@InternalAPI
private fun Application.serverSetup(
    env: Environment,
    jwkProvider: JwkProvider,
    issuer: String,
    applicationState: ApplicationState,
    meldingService: MessageQueryService,
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
        //TODO Parviz: use "localhost" in local environment
        allowHost("localhost", schemes = listOf("http", "http"))
        allowCredentials = true
    }
    routing {
        registerNaisApi(applicationState)

        if (env.isDevelopment) {
            registerMeldingerApi(meldingService)
        } else {
            //authenticate("jwt") {
                registerMeldingerApi(meldingService)
            //}
        }
    }
}
