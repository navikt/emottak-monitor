package no.nav.emottak.application.api

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.http.encodeURLParameter
import io.ktor.http.isSuccess
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.RoutingContext
import io.ktor.server.routing.get
import io.ktor.server.util.toLocalDateTime
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.getEnvVar
import no.nav.emottak.log
import no.nav.emottak.model.Pageable
import no.nav.emottak.services.MessageQueryService
import java.text.SimpleDateFormat
import java.time.LocalDateTime

val eventManagerUrl: String = getEnvVar("EVENT_MANAGER_URL", "localhost:8080")

// Meldinger (frontend: /meldinger)
@InternalAPI
fun Route.hentMeldinger(meldingService: MessageQueryService): Route =
    get("/hentmeldinger") {
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        val mottakId = getURLEncodedQueryParameter("mottakId")
        val cpaId = getURLEncodedQueryParameter("cpaId")
        val messageId = getURLEncodedQueryParameter("messageId")
        val page = getURLEncodedQueryParameter("page")
        val size = getURLEncodedQueryParameter("size")
        val sort = getURLEncodedQueryParameter("sort")
        val pageable = getPageable(page, size, sort)
        if (pageable != null) {
            log.info("Kjører dabasespørring for å hente meldinger...")
            val meldinger = meldingService.meldinger(fom, tom, mottakId, cpaId, messageId, pageable)
            log.info("Meldinger antall : ${meldinger.content.size}")
            log.info("Meldingsliste !!!! : ${meldinger.content.firstOrNull()?.mottakidliste}")
            call.respond(meldinger)
        }
    }

// Meldinger ebms (frontend: /meldingerebms)
@InternalAPI
fun Route.hentMeldingerEbms(httpClient: HttpClient): Route =
    get("/hentmeldingerebms") {
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        hentMeldingerEbms(httpClient, fom, tom)
    }

// Hendelser (frontend: /hendelser)
@InternalAPI
fun Route.hentHendelser(meldingService: MessageQueryService): Route =
    get("/henthendelser") {
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        val page = getURLEncodedQueryParameter("page")
        val size = getURLEncodedQueryParameter("size")
        val sort = getURLEncodedQueryParameter("sort")
        val pageable = getPageable(page, size, sort)
        if (pageable != null) {
            log.info("Kjører dabasespørring for å hente hendelser...")
            val hendelser = meldingService.hendelser(fom, tom, pageable)
            log.info("Hendelser antall : ${hendelser.content.size}")
            call.respond(hendelser)
        }
    }

// Hendelser ebms (frontend: /hendelserebms)
@InternalAPI
fun Route.hentHendelserEbms(httpClient: HttpClient): Route =
    get("/henthendelserebms") {
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        val page = getURLEncodedQueryParameter("page")
        val size = getURLEncodedQueryParameter("size")
        val sort = getURLEncodedQueryParameter("sort")
        val role = getURLEncodedQueryParameter("role")
        val service = getURLEncodedQueryParameter("service")
        val action = getURLEncodedQueryParameter("action")
        val pageable = getPageable(page, size, sort) // just for validation
        if (pageable != null) {
            log.info(
                "Fom : $fom, Tom : $tom, role : $role, service : $service, action : $action, page : $page, size : $size, sort : $sort",
            )
            val url =
                "$eventManagerUrl/events?fromDate=$fom&toDate=$tom" +
                    "&role=$role&service=$service&action=$action&page=$page&size=$size&sort=$sort"
            log.info("Henter hendelser fra events endepunktet til ebms ($url)")
            executeREST(httpClient, url)
        }
    }

// Modal: Ved klikk på mottak-id (frontend: /logg)
@InternalAPI
fun Route.hentLogg(meldingService: MessageQueryService): Route =
    get("/hentlogg") {
        val mottakid = call.request.queryParameters["mottakId"]
        if (mottakid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: mottakId")
            return@get
        }
        log.info("Henter hendelseslogg for $mottakid")
        val logg = meldingService.messagelogg(mottakid)
        log.info("Antall hendelser for $mottakid: ${logg.size}")
        call.respond(logg)
    }

// Modal: Ved klikk på mottak-id for ebms (frontend: /loggebms)
@InternalAPI
fun Route.hentLoggEbms(httpClient: HttpClient): Route =
    get("/hentloggebms") {
        val readableId = call.request.queryParameters["readableId"]
        if (readableId.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: readableId")
            return@get
        }
        val url = "$eventManagerUrl/message-details/$readableId/events"
        log.info("Henter hendelseslogg fra endepunktet til ebms for $readableId ($url)")
        executeREST(httpClient, url)
    }

// Modal: Ved klikk på CPA-id (frontend: /cpa/...)
@InternalAPI
fun Route.hentCpa(meldingService: MessageQueryService): Route =
    get("/hentcpa") {
        val cpaid = call.request.queryParameters["cpaId"]
        if (cpaid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: cpaId")
            return@get
        }
        log.info("Henter cpa info for $cpaid")
        val cpaInfo = meldingService.messagecpa(cpaid)
        log.info("Partner id for $cpaid: ${cpaInfo.size}")
        call.respond(cpaInfo)
    }

// Mottak-id søk (frontend: /mottakidsok)
@InternalAPI
fun Route.hentMessageInfo(meldingService: MessageQueryService): Route =
    get("/hentmessageinfo") {
        val mottakid = call.request.queryParameters["mottakId"]
        if (mottakid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: mottakId")
            return@get
        }
        log.info("Henter info for $mottakid")
        val messageInfo = meldingService.mottakid(mottakid)
        log.info("Melding info for $mottakid: ${messageInfo.size}")
        call.respond(messageInfo)
    }

// Mottak-id søk ebms (frontend: /readableidsokebms)
@InternalAPI
fun Route.hentMessageInfoEbms(httpClient: HttpClient): Route =
    get("/hentmessageinfoebms") {
        val readableId = call.request.queryParameters["readableId"]
        if (readableId.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: readableId")
            return@get
        }
        val url = "$eventManagerUrl/message-details/$readableId"
        log.info("Henter info fra events endepunktet til ebms for $readableId ($url)")
        executeREST(httpClient, url)
    }

// CPA-id søk (frontend: /cpaidsok)
@InternalAPI
fun Route.hentCpaIdInfo(meldingService: MessageQueryService): Route =
    get("/hentcpaidinfo") {
        val cpaid = call.request.queryParameters["cpaId"]
        if (cpaid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: cpaId")
            return@get
        }
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        log.info("Henter info for $cpaid")
        val cpaIdInfo = meldingService.cpaid(cpaid, fom, tom)
        log.info("Cpa id info for $cpaid: ${cpaIdInfo.size}")
        call.respond(cpaIdInfo)
    }

// CPA-id søk ebms (frontend: /cpaidsokebms)
@InternalAPI
fun Route.hentCpaIdInfoEbms(httpClient: HttpClient): Route =
    get("/hentcpaidinfoebms") {
        val cpaid = call.request.queryParameters["cpaId"]
        if (cpaid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: cpaId")
            return@get
        }
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        hentMeldingerEbms(httpClient, fom, tom)
    }

// EBMessage-id søk (frontend: /ebmessageidsok)
@InternalAPI
fun Route.hentEbMessageIdInfo(meldingService: MessageQueryService): Route =
    get("/hentebmessageidinfo") {
        val ebmessageid = call.request.queryParameters["ebmessageId"]
        if (ebmessageid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: ebmessageId")
            return@get
        }
        log.info("Henter info for $ebmessageid")
        val ebMessageIdIdInfo = meldingService.ebmessageid(ebmessageid)
        log.info("EBMessage ident info for $ebmessageid: ${ebMessageIdIdInfo.size}")
        call.respond(ebMessageIdIdInfo)
    }

// Partner-id søk (frontend: /partnersok)
@InternalAPI
fun Route.hentPartnerIdInfo(meldingService: MessageQueryService): Route =
    get("/hentpartneridinfo") {
        val partnerid = call.request.queryParameters["partnerId"]
        if (partnerid.isNullOrEmpty()) {
            returnBadRequest("Mangler parameter: partnerId")
            return@get
        }
        log.info("Henter info for partnerid : $partnerid")
        val partnerIdInfo = meldingService.partnerid(partnerid)
        log.info("Partner info for $partnerid: ${partnerIdInfo.size}")
        call.respond(partnerIdInfo)
    }

// Feilstatistikk (frontend: /feilstatistikk)
@InternalAPI
fun Route.hentFeilstatistikk(meldingService: MessageQueryService): Route =
    get("/hentfeilstatistikk") {
        val (fom, tom) = localDateTimeLocalDateTimePair() ?: return@get
        log.info("Kjører dabasespørring for å hente feil statistikk...")
        val feilStatistikk = meldingService.feilstatistikk(fom, tom)
        log.info("feil statistikk antall : ${feilStatistikk.size}")
        call.respond(feilStatistikk)
    }

// Henting av ulike from_role, service, action for bruk som filter på EBMS-hendelser
@InternalAPI
fun Route.hentRollerServicesAction(httpClient: HttpClient): Route =
    get("/hentrollerservicesaction") {
        val url = "$eventManagerUrl/filter-values"
        log.info("Henter filter-verdier for rolle, service, action ($url)")
        executeREST(httpClient, url)
    }

const val MAX_PAGE_SIZE = 1000

private suspend fun RoutingContext.getPageable(
    page: String?,
    size: String?,
    sort: String?,
    defaultSize: Int = 50,
): Pageable? {
    var pageSize = defaultSize
    if (!size.isNullOrEmpty()) {
        if (size.toIntOrNull() == null) {
            returnBadRequest("Page size ($size) must be numeric")
            return null
        }
        if (size.toInt() > MAX_PAGE_SIZE || size.toInt() < 1) {
            returnBadRequest("Page size $size must be between 1 and $MAX_PAGE_SIZE")
            return null
        }
        pageSize = size.toInt()
    }
    var pageNumber = 1
    if (!page.isNullOrEmpty()) {
        if (page.toIntOrNull() == null) {
            returnBadRequest("Page number ($page) must be numeric")
            return null
        }
        if (page.toInt() < 1) {
            returnBadRequest("Page number ($page) must be 1 or more")
            return null
        }
        pageNumber = page.toInt()
    }
    var sortOrder = "DESC"
    if (!sort.isNullOrBlank()) {
        if (!sort.startsWith("ASC", true) && !sort.startsWith("DESC", true)) {
            returnBadRequest("Invalid sort order specification: $sort, must be ASC or DESC")
            return null
        }
        sortOrder = sort
    }
    return Pageable(pageNumber, pageSize, sortOrder)
}

@InternalAPI
private suspend fun RoutingContext.hentMeldingerEbms(
    httpClient: HttpClient,
    fom: LocalDateTime,
    tom: LocalDateTime,
) {
    val page = getURLEncodedQueryParameter("page")
    val size = getURLEncodedQueryParameter("size")
    val sort = getURLEncodedQueryParameter("sort")
    val mottakId = getURLEncodedQueryParameter("mottakId")
    val cpaId = getURLEncodedQueryParameter("cpaId")
    val messageId = getURLEncodedQueryParameter("messageId")
    val role = getURLEncodedQueryParameter("role")
    val service = getURLEncodedQueryParameter("service")
    val action = getURLEncodedQueryParameter("action")
    val pageable = getPageable(page, size, sort) // just for validation
    if (pageable != null) {
        log.info(
            "Fom : $fom, Tom : $tom, mottakId : $mottakId, cpaId : $cpaId, messageId : $messageId, " +
                "role : $role, service : $service, action : $action, page : $page, size : $size, sort : $sort",
        )
        val url =
            "$eventManagerUrl/message-details?fromDate=$fom&toDate=$tom&readableId=$mottakId&cpaId=$cpaId" +
                "&messageId=$messageId&role=$role&service=$service&action=$action&page=$page&size=$size&sort=$sort"
        log.info("Henter meldinger fra message-details endepunktet til ebms ($url)")
        executeREST(httpClient, url)
    }
}

@InternalAPI
private suspend fun RoutingContext.localDateTimeLocalDateTimePair(): Pair<LocalDateTime, LocalDateTime>? {
    val fromDate = call.request.queryParameters["fromDate"]
    val toDate = call.request.queryParameters["toDate"]
    if (fromDate.isNullOrEmpty()) {
        returnBadRequest("Mangler parameter: fromDate")
        return null
    }
    val fom = SimpleDateFormat("yyyy-MM-dd HH:mm").parse(fromDate).toLocalDateTime()
    if (toDate.isNullOrEmpty()) {
        returnBadRequest("Mangler parameter: toDate")
        return null
    }
    val tom = SimpleDateFormat("yyyy-MM-dd HH:mm").parse(toDate).toLocalDateTime()
    return Pair(fom, tom)
}

private fun RoutingContext.getURLEncodedQueryParameter(paramName: String): String =
    call.request.queryParameters[paramName]
        ?.trim()
        ?.encodeURLParameter(spaceToPlus = false) ?: ""

@InternalAPI
private suspend fun RoutingContext.executeREST(
    httpClient: HttpClient,
    url: String,
) {
    try {
        val response = httpClient.get(url)
        val responseText = response.bodyAsText()
        log.info("Response tekst: $responseText")

        if (response.status.isSuccess()) {
            log.info("Lengde på responstekst : ${responseText.length}")
            call.respond(responseText)
        } else {
            log.warn("Fikk uventet statuskode ${response.status.value} tilbake: ${response.status.description}")
            call.respond(response.status, responseText)
        }
    } catch (e: Exception) {
        log.error("Feil ved kall mot $url: ${e.message}", e)
        call.respond(HttpStatusCode.InternalServerError, "Feil ved kall mot $url: ${e.message}")
    }
}

private suspend fun RoutingContext.returnBadRequest(errorMessage: String) {
    log.info(errorMessage)
    call.respond(HttpStatusCode.BadRequest, errorMessage)
}
