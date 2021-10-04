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

            log.info("Kjører dabasespørring for å hente meldinger...")
            val meldinger = meldingService.meldinger(fom, tom)
            //val logg = meldingService.messagelogg()

            log.info("Meldinger antall : ${meldinger.size}")
            log.info("Henter ut den første mottakident info: ${meldinger.firstOrNull()?.mottakid}")
            call.respond(meldinger)
        }
        get("/henthendelser") {
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

            log.info("Kjører dabasespørring for å hente hendelser...")
            val hendelser = meldingService.hendelser(fom, tom)

            log.info("Hendelser antall : ${hendelser.size}")
            call.respond(hendelser)
        }
        get("/hentlogg") {
            val mottakid = call.request.queryParameters.get("mottakId")
            if (mottakid.isNullOrEmpty()) {
                log.info("Mangler parameter: mottakid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter hendelseslogg for ${mottakid}")
            val logg = meldingService.messagelogg(mottakid)

            log.info("Antall hendelser for ${mottakid}: ${logg.size}")
            call.respond(logg)
        }
        get("/hentcpa") {
            val cpaid = call.request.queryParameters.get("cpaId")
            if (cpaid.isNullOrEmpty()) {
                log.info("Mangler parameter: cpaid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter cpa info for ${cpaid}")
            val cpaInfo = meldingService.messagecpa(cpaid)

            log.info("Partner id for ${cpaid}: ${cpaInfo.size}")
            call.respond(cpaInfo)
        }
        get("/hentmeldinginfo") {
            val mottakid = call.request.queryParameters.get("mottakId")
            if (mottakid.isNullOrEmpty()) {
                log.info("Mangler parameter: mottakid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter info for ${mottakid}")
            val meldingInfo = meldingService.mottakid(mottakid)

            log.info("Melding info for ${mottakid}: ${meldingInfo.size}")
            call.respond(meldingInfo)
        }
        get("/hentfeilstatistikk") {
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

            log.info("Kjører dabasespørring for å hente feil statistikk...")
            val feilStatistikk = meldingService.feilstatistikk(fom, tom)

            log.info("feil statistikk antall : ${feilStatistikk.size}")
            call.respond(feilStatistikk)
        }
    }
}
