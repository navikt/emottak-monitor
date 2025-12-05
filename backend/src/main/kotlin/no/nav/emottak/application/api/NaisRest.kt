package no.nav.emottak.application.api

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Routing
import io.ktor.server.routing.get
import io.ktor.utils.io.InternalAPI
import io.prometheus.metrics.model.registry.PrometheusRegistry
import no.nav.emottak.application.ApplicationState

@InternalAPI
fun Routing.registerNaisApi(
    applicationState: ApplicationState,
    readinessCheck: () -> Boolean = { applicationState.ready },
    alivenessCheck: () -> Boolean = { applicationState.alive },
    prometheusRegistry: PrometheusRegistry = PrometheusRegistry.defaultRegistry,
) {
    get("/is_alive") {
        if (alivenessCheck()) {
            call.respondText("I'm alive! :)")
        } else {
            call.respondText("I'm dead x_x", status = HttpStatusCode.InternalServerError)
        }
    }
    get("/is_ready") {
        if (readinessCheck()) {
            call.respondText("I'm ready! :)")
        } else {
            call.respondText("Please wait! I'm not ready :(", status = HttpStatusCode.InternalServerError)
        }
    }
    get("/prometheus") {
        call.respond(prometheusRegistry.scrape())
    }
}
