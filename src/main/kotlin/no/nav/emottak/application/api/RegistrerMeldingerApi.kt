package no.nav.emottak.application.api

import io.ktor.application.call
import io.ktor.http.HttpStatusCode
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import io.ktor.util.InternalAPI
import io.ktor.util.toLocalDateTime
import no.nav.emottak.log
import no.nav.emottak.services.MessageQueryService
import java.text.SimpleDateFormat

@InternalAPI
fun Route.registerMeldingerApi(meldingService: MessageQueryService) {
    route("/v1") {
        get("/hentmeldinger") {

            val fromDate = call.request.queryParameters.get("fromDate")
            val toDate = call.request.queryParameters.get("toDate")

            if (fromDate.isNullOrEmpty()) {
                log.info("Mangler parameter: from date")
                call.respond(HttpStatusCode.BadRequest)
            }

            val fom = SimpleDateFormat("yyyy-MM-dd HH:mm").parse(fromDate).toLocalDateTime()

            if (toDate.isNullOrEmpty()) {
                log.info("Mangler parameter: to date")
                call.respond(HttpStatusCode.BadRequest)
            }

            val tom = SimpleDateFormat("yyyy-MM-dd HH:mm").parse(toDate).toLocalDateTime()

            log.info("Starter med å kjøre dabasespørring")
            val meldinger = meldingService.meldinger(fom, tom)
            val roles = meldingService.role(fom, tom)
            log.info("Meldinger size : ${meldinger.size}")
            log.info("Role size : ${roles.size}")
            log.info("Service size : ${roles.size}")
            log.info("Action size : ${roles.size}")
            log.info("Hentet ut den første mottakident info: ${meldinger.firstOrNull()?.mottakid}")
            call.respond(meldinger)
        }
    }
}
