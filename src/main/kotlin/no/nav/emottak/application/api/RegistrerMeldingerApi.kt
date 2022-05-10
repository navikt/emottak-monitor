package no.nav.emottak.application.api

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.util.toLocalDateTime
import io.ktor.util.InternalAPI
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
            // val logg = meldingService.messagelogg()

            log.info("Meldinger antall : ${meldinger.size}")
            log.info("Meldingsliste !!!! : ${meldinger.firstOrNull()?.mottakidliste}")
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

            log.info("Henter hendelseslogg for $mottakid")
            val logg = meldingService.messagelogg(mottakid)

            log.info("Antall hendelser for $mottakid: ${logg.size}")
            call.respond(logg)
        }
        get("/hentcpa") {
            val cpaid = call.request.queryParameters.get("cpaId")
            if (cpaid.isNullOrEmpty()) {
                log.info("Mangler parameter: cpaid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter cpa info for $cpaid")
            val cpaInfo = meldingService.messagecpa(cpaid)

            log.info("Partner id for $cpaid: ${cpaInfo.size}")
            call.respond(cpaInfo)
        }
        get("/hentmessageinfo") {
            val mottakid = call.request.queryParameters.get("mottakId")
            if (mottakid.isNullOrEmpty()) {
                log.info("Mangler parameter: mottakid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter info for $mottakid")
            val messageInfo = meldingService.mottakid(mottakid)

            log.info("Melding info for $mottakid: ${messageInfo.size}")
            call.respond(messageInfo)
        }
        get("/hentcpaidinfo") {
            val cpaid = call.request.queryParameters.get("cpaId")
            if (cpaid.isNullOrEmpty()) {
                log.info("Mangler parameter: cpaid")
                call.respond(HttpStatusCode.BadRequest)
            }

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

            log.info("Henter info for $cpaid")
            val cpaIdInfo = meldingService.cpaid(cpaid, fom, tom)
            log.info("Cpa id info for $cpaid: ${cpaIdInfo.size}")
            call.respond(cpaIdInfo)
        }
        get("/hentebmessageidinfo") {
            val ebmessageid = call.request.queryParameters.get("ebmessageId")
            if (ebmessageid.isNullOrEmpty()) {
                log.info("Mangler parameter: ebmessageid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter info for $ebmessageid")
            val ebMessageIdIdInfo = meldingService.ebmessageid(ebmessageid)
            log.info("EBMessage ident info for $ebmessageid: ${ebMessageIdIdInfo.size}")
            call.respond(ebMessageIdIdInfo)
        }
        get("/henpartneridinfo") {
            val partnerid = call.request.queryParameters.get("partnerId")
            if (partnerid.isNullOrEmpty()) {
                log.info("Mangler parameter: partnerid")
                call.respond(HttpStatusCode.BadRequest)
            }

            log.info("Henter info for partnerid : $partnerid")
            val partnerIdInfo = meldingService.partnerid(partnerid)
            log.info("Partner info for $partnerid: ${partnerIdInfo.size}")
            call.respond(partnerIdInfo)
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
