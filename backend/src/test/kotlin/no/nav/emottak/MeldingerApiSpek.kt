package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.kotest.matchers.types.shouldBeInstanceOf
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.HttpRequestTimeoutException
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.client.statement.readRawBytes
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.fullPath
import io.ktor.http.headersOf
import io.ktor.serialization.jackson.jackson
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import no.nav.emottak.application.api.LENIENT_JSON_PARSER
import no.nav.emottak.application.api.hentAbonnementListe
import no.nav.emottak.application.api.hentCPAListe
import no.nav.emottak.application.api.hentConversationStatusEbms
import no.nav.emottak.application.api.hentCpa
import no.nav.emottak.application.api.hentFeilstatistikk
import no.nav.emottak.application.api.hentHendelser
import no.nav.emottak.application.api.hentHendelserEbms
import no.nav.emottak.application.api.hentLogg
import no.nav.emottak.application.api.hentLoggEbms
import no.nav.emottak.application.api.hentMeldinger
import no.nav.emottak.application.api.hentMeldingerEbms
import no.nav.emottak.application.api.hentPartnerListe
import no.nav.emottak.application.api.hentRetryMeldinger
import no.nav.emottak.application.api.hentRollerServicesAction
import no.nav.emottak.application.setupAuth
import no.nav.emottak.model.CpaListe
import no.nav.emottak.model.MessageLogData
import no.nav.emottak.model.Page
import no.nav.emottak.model.PartnerCpaListe
import no.nav.emottak.model.PartnerCpaListeData
import no.nav.emottak.model.PartnerListe
import no.nav.emottak.model.PartnerListeData
import no.nav.emottak.model.RetryMessageData
import no.nav.emottak.model.dto.EventDto
import no.nav.emottak.model.dto.FindByUuidRequestDto
import no.nav.emottak.model.dto.toMottakIdInfo
import no.nav.emottak.services.MessageQueryService
import no.nav.emottak.services.RetryConsumerDisabledException
import no.nav.emottak.services.RetryMessageReadException
import no.nav.emottak.services.RetryQueueKafkaReaderService
import no.nav.emottak.services.RetryReadTimeoutException
import org.apache.kafka.common.errors.TimeoutException
import java.io.IOException
import java.nio.file.Paths
import kotlin.uuid.Uuid

@InternalAPI
class MeldingerApiSpek :
    DescribeSpec(
        {
            lateinit var messageQueryService: MessageQueryService
            lateinit var mockHttpClient: HttpClient
            lateinit var mockKafkaService: RetryQueueKafkaReaderService

            beforeSpec {
                messageQueryService = mockk()
                mockKafkaService = mockk()

                val msgList = getMessages()
                coEvery {
                    messageQueryService.meldinger(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any())
                } returns
                    Page(1, msgList.size, "DESC", msgList.size.toLong(), msgList)

                val eventsList = getEvents()
                coEvery {
                    messageQueryService.hendelser(any(), any(), any(), any(), any(), any(), any())
                } returns
                    Page(1, eventsList.size, "DESC", eventsList.size.toLong(), eventsList)

                coEvery { messageQueryService.messagelogg(any()) } returns getMessageLogg()
                coEvery { messageQueryService.messagecpa(any()) } returns getMessageCpa()
                coEvery { messageQueryService.mottakid(any()) } returns getMottakIdInfo()
                coEvery { messageQueryService.feilstatistikk(any(), any()) } returns getFeilStatistikkInfo()
                coEvery { messageQueryService.cpaliste(any()) } returns getCPAListe()
                coEvery { messageQueryService.partnerliste(any()) } returns getCPAListe()
                coEvery { messageQueryService.abonnementListe() } returns getAbonnementListe()

                val restBackendMock =
                    MockEngine { request ->
                        with(request.url.fullPath) {
                            when {
                                contains("filter-values") ->
                                    respond(
                                        content =
                                            """{"roles":
                                            |["Role1","ROLE_2","Role 3"],"services":
                                            |["BehandlerKrav","HarBorgerFrikort","Inntektsforesporsel"],
                                            |"actions":["Acknowledgment","Foresporsel"],"refreshedAt":"2025-11-19T14:12:26.789263Z"}
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("message-details/") && contains("/events") ->
                                    respond(
                                        content =
                                            """[
                                            |{"eventDate":"2025-11-19T15:11:59.667195+01:00[Europe/Oslo]","eventDescription":"Melding mottatt via HTTP","eventId":"5","eventData":"","eventStatus":"Informasjon"},
                                            |{"eventDate":"2025-11-19T15:11:59.698177+01:00[Europe/Oslo]","eventDescription":"Melding validert mot CPA","eventId":"37","eventData":"","eventStatus":"Informasjon"}]
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("message-details/bulk") -> {
                                    request.method shouldBe HttpMethod.Post
                                    val request =
                                        Json.decodeFromString<FindByUuidRequestDto>(
                                            request.body.shouldBeInstanceOf<TextContent>().text,
                                        )
                                    respond(
                                        content =
                                            Json.encodeToString(
                                                getBulkMessageDetails(request.ids),
                                            ),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                }
                                contains("message-details/") ->
                                    respond(
                                        content =
                                            """[{"receivedDate":"2025-11-19T15:11:59.646898+01:00[Europe/Oslo]",
                                            |"readableId":"IN.2511191511.UNKN.123",
                                            |"requestId":"2af3496a-8d33-4af0-ab3e-fa1da4cd193e",
                                            |"role":"Utleverer",
                                            |"service":"HarBorgerEgenandelFritak",
                                            |"action":"EgenandelForesporsel",
                                            |"referenceParameter":"123",
                                            |"senderName":"Unknown",
                                            |"cpaId":"nav:qass:123",
                                            |"status":"Meldingen er ferdigbehandlet",
                                            |"conversationId":"1",
                                            |"messageId":"2"}]
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("message-details?") ->
                                    respond(
                                        content = """{"page":1,"size":10,"sort":"DESC","totalElements":0,"content":[],"totalPages":1}""",
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("events?") -> {
                                    var c = "[]"
                                    var a = 0
                                    if (request.url.fullPath.contains("&status=")) {
                                        val status =
                                            request.url.fullPath
                                                .split("&status=")[1]
                                                .split("&")[0]
                                        if (status != "") {
                                            a = 1
                                            c = "[" +
                                                "{\"eventDate\":\"2026-11-09T13:22:59.943350+01:00[Europe/Oslo]\"," +
                                                "\"description\":\"Melding lest fra kø\"," +
                                                "\"status\":\"$status\"," +
                                                "\"eventData\":\"\"," +
                                                "\"requestId\":\"a79bf82a-a197-497b-baf4-241e14a8aeee\"," +
                                                "\"readableId\":\"OUT.2606171341.NAVM.a8aeee\"," +
                                                "\"role\":\"Sykmelder\"," +
                                                "\"service\":\"Sykmelding\"," +
                                                "\"action\":\"Svar\"," +
                                                "\"referenceParameter\":null," +
                                                "\"senderName\":\"NAV\"}" +
                                                "]"
                                        }
                                    }
                                    respond(
                                        content = """{"page":1,"size":10,"sort":"DESC","totalElements":$a,"content":$c,"totalPages":1}""",
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                }
                                contains("cpa/timestamps/last_used") ->
                                    respond(
                                        // Returned timestamps are in UTC:
                                        content =
                                            """{"nav:qass:25695":null,
                                            |"nav:qass:25696":"2025-11-24T07:30:48Z",
                                            |"nav:qass:30358":"2025-11-21T23:57:20Z",
                                            |"nav:autotest:1160":null}
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("conversation-status") ->
                                    respond(
                                        content =
                                            """{"page":1,"size":3,"sort":"ASC","totalElements":3,"content":[
                                                |{"createdAt":"2025-04-30T12:59:49+02:00[Europe/Oslo]","readableIdList":"IN.2504301259.UNKN.4947c3","service":"another-service","cpaId":"test-cpa-id","statusAt":"2025-04-30T12:59:50+02:00[Europe/Oslo]","latestStatus":"Ferdigbehandlet"},
                                                |{"createdAt":"2025-04-30T12:56:47+02:00[Europe/Oslo]","readableIdList":"OUT.2504301256.NAVM.23532f","service":"test-service","cpaId":"another-cpa-id","statusAt":"2025-04-30T12:56:47+02:00[Europe/Oslo]","latestStatus":"Informasjon"},
                                                |{"createdAt":"2025-04-30T12:52:45+02:00[Europe/Oslo]","readableIdList":"IN.2504301252.UNKN.c885f9,IN.2504301254.UNKN.13b2cd,OUT.2504301258.NAVM.ec27e9","service":"test-service","cpaId":"test-cpa-id","statusAt":"2025-04-30T12:58:49+02:00[Europe/Oslo]","latestStatus":"Feil"}]
                                                |,"totalPages":1}
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                else ->
                                    respond(
                                        content = """{ "status":"bad_request" }""",
                                        status = HttpStatusCode.BadRequest,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                            }
                        }
                    }
                mockHttpClient =
                    HttpClient(restBackendMock) {
                        install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                    }
            }

            beforeEach {
                clearMocks(mockKafkaService)
            }

            describe("Authentication tests") {

                it("Should return 401 Unauthorized (messageQueryService)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        with(client.get("/v1/hentmeldinger")) {
                            this.status shouldBe HttpStatusCode.Unauthorized
                        }
                    }
                }

                it("Should return 401 Unauthorized (mockHttpClient)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        with(client.get("/v1/hentmeldingerebms")) {
                            this.status shouldBe HttpStatusCode.Unauthorized
                        }
                    }
                }

                it("Should return 401 Unauthorized (mockKafkaService)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        with(client.get("/v1/hentretrymeldinger")) {
                            this.status shouldBe HttpStatusCode.Unauthorized
                            coVerify(exactly = 0) { mockKafkaService.hentRetryMeldinger() }
                        }
                    }
                }

                it("Should return 200 OK (hentmeldinger)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentmeldinger?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentmeldingerebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentmeldingerebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (henthendelser)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/henthendelser?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (henthendelserebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentlogg)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentlogg?mottakId=123456789012345678901")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentloggebms - readableId)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentloggebms?id=IN.2511191511.UNKN.123")
                        response.status shouldBe HttpStatusCode.OK

                        val msg = Json.decodeFromString<MessageLogData>(String(response.readRawBytes()))
                        msg.meldingsdetaljer shouldNotBe null
                        msg.meldingsdetaljer!!.mottakId shouldBe "IN.2511191511.UNKN.123"
                        msg.meldingsdetaljer.messageId shouldBe "2"
                        msg.meldingsdetaljer.requestId shouldBe "2af3496a-8d33-4af0-ab3e-fa1da4cd193e"
                        msg.meldingslogg.size shouldBe 2
                        msg.meldingslogg[0].hendelsesbeskrivelse shouldBe "Melding mottatt via HTTP"
                        msg.meldingslogg[1].hendelsesbeskrivelse shouldBe "Melding validert mot CPA"
                    }
                }

                it("Should return 200 OK (hentloggebms - requestId)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentloggebms?id=2af3496a-8d33-4af0-ab3e-fa1da4cd193e")
                        response.status shouldBe HttpStatusCode.OK

                        val msg = Json.decodeFromString<MessageLogData>(String(response.readRawBytes()))
                        msg.meldingsdetaljer shouldNotBe null
                        msg.meldingsdetaljer!!.mottakId shouldBe "IN.2511191511.UNKN.123"
                        msg.meldingsdetaljer.messageId shouldBe "2"
                        msg.meldingsdetaljer.requestId shouldBe "2af3496a-8d33-4af0-ab3e-fa1da4cd193e"
                        msg.meldingslogg.size shouldBe 2
                        msg.meldingslogg[0].hendelsesbeskrivelse shouldBe "Melding mottatt via HTTP"
                        msg.meldingslogg[1].hendelsesbeskrivelse shouldBe "Melding validert mot CPA"
                    }
                }

                it("Should return 200 OK (hentcpa)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentcpa?cpaid=nav:qass:30823")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 401 Unauthorized when appId not allowed") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentmeldinger", "5", "1")
                        response.status shouldBe HttpStatusCode.Unauthorized
                    }
                }

                it("Should return 200 OK (hentfeilstatistikk)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentfeilstatistikk?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 206 Partial Content (hentcpaliste) when ebms fails to deliver lastused-timestamps") {
                    val newRestBackendMock =
                        MockEngine { _ ->
                            respond(
                                content =
                                    """{"error": "Something went wrong"}""",
                                status = HttpStatusCode.InternalServerError,
                                headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                            ).also {
                                log.info("Simulerte feil fra CPA-INFO: 'cpa/timestamps/last_used'")
                            }
                        }
                    val anotherMockHttpClient = HttpClient(newRestBackendMock) {}
                    withTestApplicationForApi(messageQueryService, anotherMockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentcpaliste")
                        response.status shouldBe HttpStatusCode.PartialContent
                        val partnerCpaListeData = LENIENT_JSON_PARSER.decodeFromString<PartnerCpaListeData>(response.bodyAsText())
                        partnerCpaListeData.totalNumberOfEntries shouldBe 432
                        partnerCpaListeData.partnerCpaListe shouldContain
                            PartnerCpaListe(
                                partnerName = "partnerName1",
                                partnerSubjectDN = "partner1",
                                partnerID = "partnerId1",
                                herID = "herId1",
                                orgNummer = "orgNr1",
                                cpaID = "nav:qass:25695",
                                navCppID = "navCppId1",
                                partnerCppID = "adminbruker",
                                partnerEndpoint = "partnerEndpoint1",
                                komSystem = "komSystem1",
                                lastUsed = "2025-11-25 07:30:48",
                                lastUsedEbms = null,
                            )
                        partnerCpaListeData.partnerCpaListe shouldContain
                            PartnerCpaListe(
                                partnerName = "partnerName2",
                                partnerSubjectDN = "partner2",
                                partnerID = "partnerId2",
                                herID = "herId2",
                                orgNummer = "orgNr2",
                                cpaID = "nav:qass:30358",
                                navCppID = "navCppId2",
                                partnerCppID = "adminbruker",
                                partnerEndpoint = "partnerEndpoint2",
                                komSystem = "komSystem2",
                                lastUsed = "2025-11-22 22:57:20",
                                lastUsedEbms = null,
                            )
                    }
                }

                it("Should return 200 OK (hentcpaliste)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentcpaliste?searchColmn=")
                        response.status shouldBe HttpStatusCode.OK

                        val partnerCpaListeData = LENIENT_JSON_PARSER.decodeFromString<PartnerCpaListeData>(response.bodyAsText())
                        partnerCpaListeData.totalNumberOfEntries shouldBe 432
                        partnerCpaListeData.partnerCpaListe shouldContain
                            PartnerCpaListe(
                                partnerName = "partnerName1",
                                partnerSubjectDN = "partner1",
                                partnerID = "partnerId1",
                                herID = "herId1",
                                orgNummer = "orgNr1",
                                cpaID = "nav:qass:25695",
                                navCppID = "navCppId1",
                                partnerCppID = "adminbruker",
                                partnerEndpoint = "partnerEndpoint1",
                                komSystem = "komSystem1",
                                lastUsed = "2025-11-25 07:30:48",
                                lastUsedEbms = null,
                            )
                        partnerCpaListeData.partnerCpaListe shouldContain
                            PartnerCpaListe(
                                partnerName = "partnerName2",
                                partnerSubjectDN = "partner2",
                                partnerID = "partnerId2",
                                herID = "herId2",
                                orgNummer = "orgNr2",
                                cpaID = "nav:qass:30358",
                                navCppID = "navCppId2",
                                partnerCppID = "adminbruker",
                                partnerEndpoint = "partnerEndpoint2",
                                komSystem = "komSystem2",
                                lastUsed = "2025-11-22 22:57:20",
                                lastUsedEbms = "2025-11-22 00:57:20",
                            )
                    }
                }

                it("Should return 200 OK (hentPartnerListe)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentpartnerliste?searchColmn=")
                        response.status shouldBe HttpStatusCode.OK

                        val partnerListeData = LENIENT_JSON_PARSER.decodeFromString<PartnerListeData>(response.bodyAsText())
                        partnerListeData.totalNumberOfEntries shouldBe 432
                        partnerListeData.partnerListe.size shouldBe 2

                        partnerListeData.partnerListe shouldContain
                            PartnerListe(
                                partnerName = "partnerName1",
                                partnerID = "partnerId1",
                                herID = "herId1",
                                orgNummer = "orgNr1",
                                komSystem = "komSystem1",
                                cpaListe =
                                    listOf(
                                        CpaListe(
                                            partnerSubjectDN = "partner1",
                                            cpaID = "nav:qass:25695",
                                            navCppID = "navCppId1",
                                            partnerCppID = "adminbruker",
                                            partnerEndpoint = "partnerEndpoint1",
                                            lastUsed = "2025-11-25 07:30:48",
                                            lastUsedEbms = null,
                                        ),
                                    ),
                            )

                        partnerListeData.partnerListe shouldContain
                            PartnerListe(
                                partnerName = "partnerName2",
                                partnerID = "partnerId2",
                                herID = "herId2",
                                orgNummer = "orgNr2",
                                komSystem = "komSystem2",
                                cpaListe =
                                    listOf(
                                        CpaListe(
                                            partnerSubjectDN = "partner2",
                                            cpaID = "nav:qass:30358",
                                            navCppID = "navCppId2",
                                            partnerCppID = "adminbruker",
                                            partnerEndpoint = "partnerEndpoint2",
                                            lastUsed = "2025-11-22 22:57:20",
                                            lastUsedEbms = "2025-11-22 00:57:20",
                                        ),
                                    ),
                            )
                    }
                }

                it("Should return 200 OK (hentconversationstatusebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentconversationstatusebms")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentabonnementliste)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response = client.getWithAuth("/v1/hentabonnementliste")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentretrymeldinger)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns RetryMessageData(emptyList())
                        val response = client.getWithAuth("/v1/hentretrymeldinger")
                        response.status shouldBe HttpStatusCode.OK
                    }
                }
            }

            describe("Pagination tests") {

                it("Should return 400 BAD REQUEST for page less than 1") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=0&size=50",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for non-numeric page") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=zero&size=50",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for size less than 1") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=0",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for size greater than 1000") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=1001",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for non-numeric size") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=BIG",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 200 OK for OK page and size given") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=10&size=1000",
                            )
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 400 BAD REQUEST for bad sort order") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&sort=UPWARDS",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 200 OK for OK sort order") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&sort=ASC",
                            )
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK for blank page, size and sort") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=&size=&sort=",
                            )
                        response.status shouldBe HttpStatusCode.OK
                    }
                }
            }

            describe("Validate requests parameters") {

                it("henthendelserebms: Should filter on status Informasjon") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=Meldingen%20er%20under%20behandling",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 1
                        page.content[0].status shouldBe "Informasjon"
                    }
                }

                it("henthendelserebms: Should filter on status Feil") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=Meldingen%20feilet%20under%20behandling",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 1
                        page.content[0].status shouldBe "Feil"
                    }
                }

                it("henthendelserebms: Should filter on status Ferdigbehandlet") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=Meldingen%20er%20ferdigbehandlet",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 1
                        page.content[0].status shouldBe "Ferdigbehandlet"
                    }
                }

                it("henthendelserebms: Should ignore empty status filter") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 0
                    }
                }

                it("henthendelserebms: Status with spaces is fine") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=Meldingen er under behandling",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 1
                        page.content[0].status shouldBe "Informasjon"
                    }
                }

                it("henthendelserebms: Status with plus is fine") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/henthendelserebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=Meldingen+er+under+behandling",
                            )
                        response.status shouldBe HttpStatusCode.OK
                        val page = LENIENT_JSON_PARSER.decodeFromString<Page<EventDto>>(response.bodyAsText())
                        page.totalElements shouldBe 1
                        page.content[0].status shouldBe "Informasjon"
                    }
                }

                it("hentmeldinger: Should accept valid status (info)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=info",
                            )
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("hentmeldinger: Should return BadRequest at invalid status (informasjon)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val response =
                            client.getWithAuth(
                                "/v1/hentmeldinger?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10&status=informasjon",
                            )
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }
            }

            describe("Retry-queue reader tests") {

                it("returns retry messages and accumulated warnings") {
                    val mockHttpClient =
                        HttpClient(
                            MockEngine {
                                respond(
                                    content = """{"content":{},"invalidIds":["ABC"]}""".trimMargin(), // 1 ID'er var ugyldige.
                                    status = HttpStatusCode.OK,
                                    headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                )
                            },
                        ) {
                            install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                        }
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val data = getRetryMessages().copy(warning = "There are more messages.")
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns data

                        val response = client.getWithAuth("/v1/hentretrymeldinger")

                        response.status shouldBe HttpStatusCode.OK
                        val retryMessageData = Json.decodeFromString<RetryMessageData>(response.bodyAsText())
                        retryMessageData shouldNotBe null
                        retryMessageData.retryMessages shouldBe data.retryMessages
                        retryMessageData.warning shouldBe
                            "${data.warning}\n1 ID'er var ugyldige.\nMangler meldingsdetaljer for 1 retry-meldinger."
                    }
                }

                it("returns error status when kafka lookup fails") {
                    val failures =
                        listOf(
                            RetryConsumerDisabledException() to HttpStatusCode.ServiceUnavailable,
                            RetryReadTimeoutException() to HttpStatusCode.GatewayTimeout,
                            RetryMessageReadException("Retry record has no key") to HttpStatusCode.BadGateway,
                            TimeoutException("Broker details must not be exposed") to HttpStatusCode.ServiceUnavailable,
                        )
                    for ((failure, status) in failures) {
                        coEvery { mockKafkaService.hentRetryMeldinger() } throws failure
                        withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                            val response = client.getWithAuth("/v1/hentretrymeldinger")
                            response.status shouldBe status
                            response.bodyAsText().contains("Broker details") shouldBe false
                            if (failure is RetryMessageReadException) {
                                response.bodyAsText() shouldContain "Retry record has no key"
                            }
                        }
                    }
                }

                it("should not fail when bulk data request fails, but return warning instead") {
                    val failures =
                        listOf(
                            HttpRequestTimeoutException("Secret URL", 123) to "Tidsavbrudd ved henting av meldingsdetaljer.",
                            IOException("Secret IO-error") to "Kunne ikke hente meldingsdetaljer fra emottak-event-manager.",
                            SerializationException("Secret Serialization-error") to
                                "emottak-event-manager returnerte ugyldig JSON (SerializationException).",
                        )
                    val data = getRetryMessages()
                    for ((failure, failureMessage) in failures) {
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns data
                        val mockHttpClient =
                            HttpClient(MockEngine { throw failure }) {
                                install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                            }
                        withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                            val response = client.getWithAuth("/v1/hentretrymeldinger")
                            response.status shouldBe HttpStatusCode.OK
                            val retryMessageData = Json.decodeFromString<RetryMessageData>(response.bodyAsText())
                            retryMessageData shouldNotBe null
                            retryMessageData.retryMessages shouldBe data.retryMessages
                            retryMessageData.warning shouldBe failureMessage
                            retryMessageData.warning shouldNotContain "Secret"
                        }
                    }
                }

                it("should merge kafka and REST data, and have no warnings") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val data = getRetryMessages()
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns data

                        val response = client.getWithAuth("/v1/hentretrymeldinger")

                        response.status shouldBe HttpStatusCode.OK
                        val retryMessageData = Json.decodeFromString<RetryMessageData>(response.bodyAsText())
                        retryMessageData shouldNotBe null
                        retryMessageData.warning shouldBe null
                        retryMessageData.retryMessages.size shouldBe data.retryMessages.size
                        retryMessageData.retryMessages[0].message shouldNotBe null
                        val id = retryMessageData.retryMessages[0].requestId
                        retryMessageData.retryMessages[0].message shouldBe createReadableIdDto(id, "IN.1").toMottakIdInfo()
                    }
                }

                it("should warn (not fail) if response from emottak-event-manager is invalid") {
                    var emottakEventManagerCalls = 0
                    val restBackendMock =
                        MockEngine {
                            emottakEventManagerCalls++
                            respond(
                                content = """{"content":{},"invalidIds":[],"something":"invalid"}""",
                                status = HttpStatusCode.OK,
                                headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                            )
                        }
                    mockHttpClient =
                        HttpClient(restBackendMock) {
                            install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                        }
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns getRetryMessages()

                        val response = client.getWithAuth("/v1/hentretrymeldinger")

                        coVerify(exactly = 1) { mockKafkaService.hentRetryMeldinger() }
                        emottakEventManagerCalls shouldBe 1
                        response.status shouldBe HttpStatusCode.OK
                        val retryMessageData = Json.decodeFromString<RetryMessageData>(response.bodyAsText())
                        retryMessageData shouldNotBe null
                        retryMessageData.warning shouldNotBe null
                        retryMessageData.warning shouldBe "emottak-event-manager returnerte ugyldig JSON (JsonDecodingException)."
                    }
                }

                it("should preserve messages order as returned from kafka") {
                    var emottakEventManagerCalls = 0
                    val mockHttpClient =
                        HttpClient(
                            MockEngine {
                                emottakEventManagerCalls++
                                val request = Json.decodeFromString<FindByUuidRequestDto>(it.body.shouldBeInstanceOf<TextContent>().text)
                                respond(
                                    content =
                                        Json.encodeToString(
                                            getBulkMessageDetails(request.ids.reversed()),
                                        ),
                                    status = HttpStatusCode.OK,
                                    headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                )
                            },
                        ) {
                            install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                        }
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        val data =
                            getRetryMessages(
                                listOf(
                                    Uuid.random().toString(),
                                    Uuid.random().toString(),
                                    Uuid.random().toString(),
                                ),
                            )
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns data

                        val response = client.getWithAuth("/v1/hentretrymeldinger")

                        coVerify(exactly = 1) { mockKafkaService.hentRetryMeldinger() }
                        emottakEventManagerCalls shouldBe 1
                        response.status shouldBe HttpStatusCode.OK
                        val retryMessageData = Json.decodeFromString<RetryMessageData>(response.bodyAsText())
                        retryMessageData shouldNotBe null
                        retryMessageData.warning shouldBe null
                        retryMessageData.retryMessages.size shouldBe 3
                        retryMessageData.retryMessages[0].requestId shouldBe data.retryMessages[0].requestId
                        retryMessageData.retryMessages[0].message shouldNotBe null
                        retryMessageData.retryMessages[0].message!!.mottakId shouldBe "IN.3"
                        retryMessageData.retryMessages[1].requestId shouldBe data.retryMessages[1].requestId
                        retryMessageData.retryMessages[1].message shouldNotBe null
                        retryMessageData.retryMessages[1].message!!.mottakId shouldBe "IN.2"
                        retryMessageData.retryMessages[2].requestId shouldBe data.retryMessages[2].requestId
                        retryMessageData.retryMessages[2].message shouldNotBe null
                        retryMessageData.retryMessages[2].message!!.mottakId shouldBe "IN.1"
                    }
                }

                it("should not call emottak-event-manager when there is no messages on retry") {
                    var emottakEventManagerCalls = 0
                    val restBackendMock =
                        MockEngine {
                            emottakEventManagerCalls++
                            respond(
                                content = Json.encodeToString(getBulkMessageDetails()),
                                status = HttpStatusCode.OK,
                                headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                            )
                        }
                    mockHttpClient =
                        HttpClient(restBackendMock) {
                            install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) { json() }
                        }
                    withTestApplicationForApi(messageQueryService, mockHttpClient, mockKafkaService) {
                        coEvery { mockKafkaService.hentRetryMeldinger() } returns RetryMessageData(emptyList())
                        val response = client.getWithAuth("/v1/hentretrymeldinger")
                        response.status shouldBe HttpStatusCode.OK
                        coVerify(exactly = 1) { mockKafkaService.hentRetryMeldinger() }
                        emottakEventManagerCalls shouldBe 0
                    }
                }
            }
        },
    )

@OptIn(InternalAPI::class)
private fun <T> withTestApplicationForApi(
    messageQueryService: MessageQueryService,
    mockHttpClient: HttpClient,
    mockKafkaService: RetryQueueKafkaReaderService,
    testBlock: suspend ApplicationTestBuilder.() -> T,
) = testApplication {
    application({
        install(ContentNegotiation) {
            jackson {
                registerModule(JavaTimeModule())
                registerKotlinModule()
            }
        }
        val path = "src/test/resources/jwkset.json"
        val uri = Paths.get(path).toUri().toURL()
        val jwkProvider = JwkProviderBuilder(uri).build()
        setupAuth("clientId", jwkProvider, "https://sts.issuer.net/myid")
        routing {
            authenticate("jwt") {
                route("/v1") {
                    hentMeldinger(messageQueryService)
                    hentMeldingerEbms(mockHttpClient)
                    hentHendelser(messageQueryService)
                    hentHendelserEbms(mockHttpClient)
                    hentLogg(messageQueryService)
                    hentLoggEbms(mockHttpClient)
                    hentCpa(messageQueryService)
                    hentFeilstatistikk(messageQueryService)
                    hentRollerServicesAction(mockHttpClient)
                    hentCPAListe(messageQueryService, mockHttpClient)
                    hentPartnerListe(messageQueryService, mockHttpClient)
                    hentAbonnementListe(messageQueryService)
                    hentConversationStatusEbms(mockHttpClient)
                    hentRetryMeldinger(mockKafkaService, mockHttpClient)
                }
            }
        }
    })
    testBlock()
}

suspend fun HttpClient.getWithAuth(
    url: String,
    consumerClientId: String = "frontend",
    audience: String = "clientId",
): io.ktor.client.statement.HttpResponse =
    this.get(url) {
        header(HttpHeaders.Authorization, "Bearer ${generateJWT(consumerClientId, audience)}")
    }
