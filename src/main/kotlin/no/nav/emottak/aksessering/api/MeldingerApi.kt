package no.nav.emottak.aksessering.api

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import no.nav.emottak.log
import no.nav.emottak.services.MessageQueryService

fun Route.registrerMeldingerApi(messageQueryService: MessageQueryService) {
    route("/v1") {
        get("/meldinger") {
            log.info("Received call to /api/v1/meldinger")
            call.respond(messageQueryService.hentMeldinger())
        }
    }
}
