package no.nav.emottak.application.api

import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.response.respondTextWriter
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.util.InternalAPI
import io.ktor.util.toLocalDateTime
import io.prometheus.client.CollectorRegistry
import io.prometheus.client.exporter.common.TextFormat
import java.text.SimpleDateFormat
import no.nav.emottak.FetchDatabase
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.log

@InternalAPI
fun Routing.registerNaisApi(
    applicationState: ApplicationState,
    readynessCheck: () -> Boolean = { applicationState.ready },
    alivenessCheck: () -> Boolean = { applicationState.alive },
    collectorRegistry: CollectorRegistry = CollectorRegistry.defaultRegistry
) {
    get("/is_alive") {
        if (alivenessCheck()) {
            call.respondText("I'm alive! :)")
        } else {
            call.respondText("I'm dead x_x", status = HttpStatusCode.InternalServerError)
        }
    }
    get("/is_ready") {
        if (readynessCheck()) {
            call.respondText("I'm ready! :)")
        } else {
            call.respondText("Please wait! I'm not ready :(", status = HttpStatusCode.InternalServerError)
        }
    }
    get("/prometheus") {
        val names = call.request.queryParameters.getAll("name[]")?.toSet() ?: setOf()
        call.respondTextWriter(ContentType.parse(TextFormat.CONTENT_TYPE_004)) {
            TextFormat.write004(this, collectorRegistry.filteredMetricFamilySamples(names))
        }
    }
    get("/hentmeldinger") {

        val fromDate = call.request.queryParameters.get("fromDate")
        val toDate = call.request.queryParameters.get("toDate")

        if (fromDate.isNullOrEmpty()) {
            log.info("Mangler parameter: from date")
            call.respond(HttpStatusCode.BadRequest)
        }

        val fom = SimpleDateFormat("dd-MM-yyyy HH:mm:ss").parse(fromDate).toLocalDateTime()

        if (toDate.isNullOrEmpty()) {
            log.info("Mangler parameter: to date")
            call.respond(HttpStatusCode.BadRequest)
        }

        val tom = SimpleDateFormat("dd-MM-yyyy HH:mm:ss").parse(toDate).toLocalDateTime()

        log.info("Starter med å kjøre dabasespørring")

        val meldinger = FetchDatabase.fetchMeldinger(fom, tom)

        log.info("Hentet ut den første mottakiden info: ${meldinger.firstOrNull()?.mottakid}")
    }
}
