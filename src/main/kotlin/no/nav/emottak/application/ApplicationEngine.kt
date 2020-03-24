package no.nav.emottak.application

import io.ktor.routing.routing
import io.ktor.server.engine.ApplicationEngine
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.util.InternalAPI
import no.nav.emottak.Environment
import no.nav.emottak.application.api.registerNaisApi

@InternalAPI
fun createApplicationEngine(
    env: Environment,
    applicationState: ApplicationState
): ApplicationEngine =
    embeddedServer(Netty, env.applicationPort) {
        routing {
            registerNaisApi(applicationState)
        }
    }
