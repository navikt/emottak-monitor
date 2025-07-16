package no.nav.emottak.application.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.RoutingContext
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.util.toLocalDateTime
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.getEnvVar
import no.nav.emottak.log
import no.nav.emottak.services.MessageQueryService
import java.text.SimpleDateFormat
import java.time.LocalDateTime

val eventManagerUrl: String = getEnvVar("EVENT_MANAGER_URL", "localhost:8080")

@InternalAPI
fun Route.registerMeldingerApi(meldingService: MessageQueryService) {
    route("/v1") {
        authenticate("jwt") {
            get("/hentmeldinger") {
                val (fom, tom) = localDateTimeLocalDateTimePair()
                log.info("Kjører dabasespørring for å hente meldinger...")
                val meldinger = meldingService.meldinger(fom, tom)
                log.info("Meldinger antall : ${meldinger.size}")
                log.info("Meldingsliste !!!! : ${meldinger.firstOrNull()?.mottakidliste}")
                call.respond(meldinger)
            }
            get("/hentmeldingerebms") {
                val (fom, tom) = localDateTimeLocalDateTimePair()
                log.info("Fom : $fom, Tom : $tom")
                log.info("Henter meldinger fra meldinger endepunktet til ebms ...")
                val meldingerrebms =
                    HttpClient(CIO) {
                    }.get(
                        "$eventManagerUrl/fetchMessageDetails?fromDate=$fom&toDate=$tom",
                    ).bodyAsText()
                log.info("Meldinger fra ebms : $meldingerrebms")
                log.info("Antall meldinger fra ebms : ${meldingerrebms.length}")
                call.respond(meldingerrebms)
            }
            get("/henthendelser") {
                val (fom, tom) = localDateTimeLocalDateTimePair()
                log.info("Kjører dabasespørring for å hente hendelser...")
                val hendelser = meldingService.hendelser(fom, tom)
                log.info("Hendelser antall : ${hendelser.size}")
                call.respond(hendelser)
            }
            get("/henthendelserebms") {
                val (fom, tom) = localDateTimeLocalDateTimePair()
                log.info("Fom : $fom, Tom : $tom")
                log.info("Henter hendelser fra events endepunktet til ebms ...")
                val hendelserebms =
                    HttpClient(CIO) {
                    }.get(
                        "$eventManagerUrl/fetchevents?fromDate=$fom&toDate=$tom",
                    ).bodyAsText()
                log.info("Hendelser fra ebms : $hendelserebms")
                log.info("Antall hendelser fra ebms : ${hendelserebms.length}")
                call.respond(hendelserebms)
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

            get("/hentloggebms") {
                val mottakid = call.request.queryParameters.get("mottakId")
                if (mottakid.isNullOrEmpty()) {
                    log.info("Mangler parameter: mottakid")
                    call.respond(HttpStatusCode.BadRequest)
                }
                log.info("Henter hendelseslogg fra endepunktet til ebms for $mottakid")
                val loggebms =
                    HttpClient(CIO) {
                    }.get(
                        "$eventManagerUrl/fetchMessageLoggInfo?requestId=$mottakid",
                    ).bodyAsText()

                log.info("Antall hendelser for $mottakid: ${loggebms.length}")
                call.respond(loggebms)
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
                val (fom, tom) = localDateTimeLocalDateTimePair()
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
            get("/hentpartneridinfo") {
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
                val (fom, tom) = localDateTimeLocalDateTimePair()
                log.info("Kjører dabasespørring for å hente feil statistikk...")
                val feilStatistikk = meldingService.feilstatistikk(fom, tom)

                log.info("feil statistikk antall : ${feilStatistikk.size}")
                call.respond(feilStatistikk)
            }
        }
    }
}

@InternalAPI
private suspend fun RoutingContext.localDateTimeLocalDateTimePair(): Pair<LocalDateTime, LocalDateTime> {
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
    return Pair(fom, tom)
}
