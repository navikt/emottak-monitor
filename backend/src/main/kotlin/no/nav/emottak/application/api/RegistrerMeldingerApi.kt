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
import kotlinx.serialization.json.Json
import no.nav.emottak.getEnvVar
import no.nav.emottak.log
import no.nav.emottak.model.CpaListeData
import no.nav.emottak.model.Pageable
import no.nav.emottak.services.MessageQueryService
import java.text.SimpleDateFormat
import java.time.LocalDateTime

val eventManagerUrl: String = getEnvVar("EVENT_MANAGER_URL", "localhost:8080")
val cpaRepoUrl: String = getEnvVar("CPA_REPO_URL", "localhost:8080")

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

// Henting av Partner- og CPA-informasjon, med last used fra gamle og nye emottak (/cpaliste)
@InternalAPI
fun Route.hentCPAListe(
    meldingService: MessageQueryService,
    httpClient: HttpClient,
): Route =
    get("/hentcpaliste") {
        log.info("Kjører dabasespørring for å hente liste over CPA'er...")
        val page = getURLEncodedQueryParameter("page")
        val size = getURLEncodedQueryParameter("size")
        val searchColmn = getURLEncodedQueryParameter("searchColmn")
        val hideUsedCpaMonths = getURLEncodedQueryParameter("hideUsedCpaMonths").toLong(0)
        val pageable = getPageable(page, size, null)

        if (pageable != null) {
            // Nye emottak:
            val responseEbms: Map<String, String?>? = hentSistBruktNyeEmottak(httpClient)

            // Gamle emottak:
            val cpalisteData: CpaListeData = meldingService.cpaliste(searchColmn, hideUsedCpaMonths, pageable)
            val cpaliste = cpalisteData.page
            log.info("Pageable: $pageable")
            log.info("hideUsedCpaMonths: $hideUsedCpaMonths")
            log.info("Totalt antall CPA'er: ${cpalisteData.totalNumberOfCPAs}")
            log.info("Antall som matcher filteret: ${cpaliste.totalElements}")
            log.info("cpaliste.page: ${cpaliste.page}")
            log.info("cpaliste.size: ${cpaliste.size}")
            log.info("content.size: ${cpaliste.content.size}")
            log.info("partnerID: ${cpaliste.content.firstOrNull()?.partnerID}")
            log.info("cpaId:${cpaliste.content.firstOrNull()?.cpaID}")
            log.info("partnerCppID: ${cpaliste.content.firstOrNull()?.partnerCppID}")
            log.info("SubjectDN: ${cpaliste.content.firstOrNull()?.partnerSubjectDN}")
            log.info("Endpoint: ${cpaliste.content.firstOrNull()?.partnerEndpoint}")
            log.info("LastUsed: ${cpaliste.content.firstOrNull()?.lastUsed}")

            val mergedList = cpaliste.content.toMutableList()
            if (responseEbms != null) {
                for (cpaListe in mergedList) {
                    if (cpaListe.lastUsed != null) {
                        cpaListe.lastUsed = cpaListe.lastUsed!!.split(" ")[0]
                    }
                    if (cpaListe.cpaID == null) {
                        continue
                    }
                    if (cpaListe.cpaID in responseEbms.keys && responseEbms[cpaListe.cpaID] != null) {
                        cpaListe.lastUsedEbms = responseEbms[cpaListe.cpaID]!!.split("T")[0]
                    }
                }
            }
            // TODO: Kan vi risikere at nye eMottak returnerer en CPA-id som ikke finnes i gamle eMottak?

            call.respond(
                status =
                    when (responseEbms == null) {
                        true -> HttpStatusCode.PartialContent
                        false -> HttpStatusCode.OK
                    },
                message = cpalisteData,
            )
        }
    }

@InternalAPI
private suspend fun RoutingContext.hentSistBruktNyeEmottak(httpClient: HttpClient): Map<String, String?>? {
    val url = "$cpaRepoUrl/cpa/timestamps/last_used"
    log.info("Henter sist brukt-timestamps fra nye emottak ($url)")
    val (responseCode, responseBody) = executeREST(httpClient, url, useCallRespond = false)
    if (responseCode != HttpStatusCode.OK) {
        log.error("Hente sist brukt fra nye emottak feilet (HTTP $responseCode): $responseBody")
        return null
    }
    return Json
        .decodeFromString<Map<String, String?>>(responseBody)
        .also {
            log.info("Antall CPA sist brukt nye emottak: ${it.size}")
        }
}

// Conversation-status (frontend: /conversationstatusebms)
@InternalAPI
fun Route.hentConversationStatusEbms(httpClient: HttpClient): Route =
    get("/hentconversationstatusebms") {
        val page = getURLEncodedQueryParameter("page")
        val size = getURLEncodedQueryParameter("size")
        val sort = getURLEncodedQueryParameter("sort")
        val fromDate = getLocalDateTime("fromDate")
        val fom = "fromDate=${fromDate ?: ""}"
        val toDate = getLocalDateTime("toDate")
        val tom = "toDate=${toDate ?: ""}"
        val cpaId = getURLEncodedQueryParameter("cpaId")
        val service = getURLEncodedQueryParameter("service")
        val statuses = getURLEncodedQueryParameter("statuses")
        val pageable = getPageable(page, size, sort) // just for validation
        if (pageable != null) {
            log.info(
                "fromDate : $fromDate, toDate : $toDate, cpaId : $cpaId, service : $service, " +
                    "statuses : $statuses, page : $page, size : $size, sort : $sort",
            )
            val url =
                "$eventManagerUrl/conversation-status?$fom&$tom&cpaId=$cpaId" +
                    "&service=$service&statuses=$statuses&page=$page&size=$size&sort=$sort"
            log.info("Henter conversation-statuses for ebms ($url)")
            executeREST(httpClient, url)
        }
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
    val fromDate = getLocalDateTime("fromDate")
    val toDate = getLocalDateTime("toDate")
    if (fromDate == null) {
        returnBadRequest("Mangler parameter: fromDate")
        return null
    }
    if (toDate == null) {
        returnBadRequest("Mangler parameter: toDate")
        return null
    }
    return Pair(fromDate, toDate)
}

@InternalAPI
private fun RoutingContext.getLocalDateTime(param: String): LocalDateTime? {
    val date = call.request.queryParameters[param]
    if (!date.isNullOrEmpty()) {
        return SimpleDateFormat("yyyy-MM-dd HH:mm").parse(date).toLocalDateTime()
    }
    return null
}

private fun RoutingContext.getURLEncodedQueryParameter(paramName: String): String =
    call.request.queryParameters[paramName]
        ?.trim()
        ?.encodeURLParameter(spaceToPlus = false) ?: ""

@InternalAPI
private suspend fun RoutingContext.executeREST(
    httpClient: HttpClient,
    url: String,
    useCallRespond: Boolean = true,
): Pair<HttpStatusCode, String> {
    try {
        val response = httpClient.get(url)
        val responseText = response.bodyAsText()
        log.debug("Response tekst: $responseText")

        if (response.status.isSuccess()) {
            log.info("Lengde på responstekst : ${responseText.length}")
            if (useCallRespond) call.respond(responseText) else return Pair(HttpStatusCode.OK, responseText)
        } else {
            log.warn("Fikk uventet statuskode ${response.status.value} tilbake: ${response.status.description}")
            if (useCallRespond) call.respond(response.status, responseText) else return Pair(response.status, responseText)
        }
    } catch (e: Exception) {
        log.error("Feil ved kall mot $url: ${e.message}", e)
        if (useCallRespond) {
            call.respond(HttpStatusCode.InternalServerError, "Feil ved kall mot $url: ${e.message}")
        } else {
            return Pair(HttpStatusCode.InternalServerError, "Feil ved kall mot $url: ${e.message}")
        }
    }
    return Pair(HttpStatusCode.InternalServerError, "")
}

private suspend fun RoutingContext.returnBadRequest(errorMessage: String) {
    log.error(errorMessage)
    call.respond(HttpStatusCode.BadRequest, errorMessage)
}

private fun String.toLong(default: Long): Long {
    return try {
        this.toLong()
    } catch (e: NumberFormatException) {
        default
    }
}
