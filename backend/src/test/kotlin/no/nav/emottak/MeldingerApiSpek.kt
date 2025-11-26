package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.fullPath
import io.ktor.http.headersOf
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import io.mockk.mockk
import no.nav.emottak.application.api.LENIENT_JSON_PARSER
import no.nav.emottak.application.api.hentCpa
import no.nav.emottak.application.api.hentCpaIdInfo
import no.nav.emottak.application.api.hentCpaIdInfoEbms
import no.nav.emottak.application.api.hentEbMessageIdInfo
import no.nav.emottak.application.api.hentFeilstatistikk
import no.nav.emottak.application.api.hentHendelser
import no.nav.emottak.application.api.hentHendelserEbms
import no.nav.emottak.application.api.hentLogg
import no.nav.emottak.application.api.hentLoggEbms
import no.nav.emottak.application.api.hentMeldinger
import no.nav.emottak.application.api.hentMeldingerEbms
import no.nav.emottak.application.api.hentMessageInfo
import no.nav.emottak.application.api.hentMessageInfoEbms
import no.nav.emottak.application.api.hentPartnerIdInfo
import no.nav.emottak.application.api.hentRollerServicesAction
import no.nav.emottak.application.api.hentSistBrukt
import no.nav.emottak.application.setupAuth
import no.nav.emottak.model.CpaLastUsed
import no.nav.emottak.model.Page
import no.nav.emottak.services.MessageQueryService
import java.nio.file.Paths

@InternalAPI
class MeldingerApiSpek :
    DescribeSpec(
        {
            lateinit var messageQueryService: MessageQueryService
            lateinit var mockHttpClient: HttpClient

            beforeSpec {
                messageQueryService = mockk()
                val list = getMessages()
                io.mockk.coEvery { messageQueryService.meldinger(any(), any(), any(), any(), any(), any()) } returns
                    Page(1, list.size, "DESC", list.size.toLong(), list)

                io.mockk.coEvery { messageQueryService.messagelogg(any()) } returns getMessageLogg()
                io.mockk.coEvery { messageQueryService.messagecpa(any()) } returns getMessageCpa()
                io.mockk.coEvery { messageQueryService.mottakid(any()) } returns getMottakIdInfo()
                io.mockk.coEvery { messageQueryService.partnerid(any()) } returns getPartnerIdInfo()
                io.mockk.coEvery { messageQueryService.ebmessageid(any()) } returns getEBMessageIdInfo()
                io.mockk.coEvery { messageQueryService.cpaid(any(), any(), any()) } returns getCpaIdInfo()
                io.mockk.coEvery { messageQueryService.feilstatistikk(any(), any()) } returns getFeilStatistikkInfo()
                io.mockk.coEvery { messageQueryService.sistBrukt() } returns getLastUsed()

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
                                            |{"eventDate":"2025-11-19T15:11:59.667195+01:00[Europe/Oslo]","eventDescription":"Melding mottatt via HTTP","eventId":"5"},
                                            |{"eventDate":"2025-11-19T15:11:59.698177+01:00[Europe/Oslo]","eventDescription":"Melding validert mot CPA","eventId":"37"}]
                                            """.trimMargin(),
                                        status = HttpStatusCode.OK,
                                        headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString()),
                                    )
                                contains("message-details/") ->
                                    respond(
                                        content =
                                            """[{"receivedDate":"2025-11-19T15:11:59.646898+01:00[Europe/Oslo]",
                                            |"readableId":"IN.2511191511.UNKN.123",
                                            |"role":"Utleverer",
                                            |"service":"HarBorgerEgenandelFritak",
                                            |"action":"EgenandelForesporsel",
                                            |"referenceParameter":"123",
                                            |"senderName":"Unknown",
                                            |"cpaId":"nav:qass:123",
                                            |"status":"Meldingen er ferdigbehandlet"}]
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
                                contains("cpa/timestamps/last_used") ->
                                    respond(
                                        content =
                                            """{"nav:qass:25695":null,
                                            |"nav:qass:25696":"2025-11-24T07:30:48Z",
                                            |"nav:qass:30358":"2025-11-21T07:57:20Z",
                                            |"nav:autotest:1160":null}
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
                    HttpClient(restBackendMock) {}
            }

            describe("Validate requests with authentication") {

                it("Should return 401 Unauthorized (messageQueryService)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        with(client.get("/v1/hentmeldinger")) {
                            this.status shouldBe HttpStatusCode.Unauthorized
                        }
                    }
                }

                it("Should return 401 Unauthorized (mockHttpClient)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        with(client.get("/v1/hentmeldingerebms")) {
                            this.status shouldBe HttpStatusCode.Unauthorized
                        }
                    }
                }

                it("Should return 200 OK (hentmeldinger)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentmeldingerebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldingerebms?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentlogg)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentlogg?mottakId=123456789012345678901") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentloggebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentloggebms?readableId=IN.2511191511.UNKN.123") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentcpa)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentcpa?cpaid=nav:qass:30823") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentmessageinfo)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmessageinfo?mottakId=123456789012345678901") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentmessageinfoebms)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmessageinfoebms?readableId=IN.2511191511.UNKN.123") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentcpaidinfo)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get(
                                "/v1/hentcpaidinfo?cpaId=985033633_889640782_eResept&fromDate=28-04-2022 09:10:10&toDate=28-04-2022 10:00:10",
                            ) {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentebmessageidinfo)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentebmessageidinfo?ebmessageId=20220428-090325-98770@qa.ebxml.nav.no") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentpartneridinfo)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentpartneridinfo?partnerId=18736") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 401 Unauthorized when appId not allowed") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("5", "1")}")
                            }
                        response.status shouldBe HttpStatusCode.Unauthorized
                    }
                }

                it("Should return 200 OK (hentfeilstatistikk)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentfeilstatistikk?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK (hentsistbrukt)") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentsistbrukt") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                        val lastUsedList = LENIENT_JSON_PARSER.decodeFromString<List<CpaLastUsed>>(response.bodyAsText())
                        lastUsedList shouldContain CpaLastUsed("nav:qass:25695", "2025-11-25", null)
                        lastUsedList shouldContain CpaLastUsed("nav:qass:25696", null, "2025-11-24")
                        lastUsedList shouldContain CpaLastUsed("nav:qass:30358", "2025-11-22", "2025-11-21")
                    }
                }
            }

            describe("Pagination tests") {

                it("Should return 400 BAD REQUEST for page less than 1") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=0&size=50") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for non-numeric page") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=zero&size=50") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for size less than 1") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=0") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for size greater than 1000") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=1001") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 400 BAD REQUEST for non-numeric size") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=1&size=BIG") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 200 OK for OK page and size given") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=10&size=1000") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 400 BAD REQUEST for bad sort order") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&sort=UPWARDS") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }

                it("Should return 200 OK for OK sort order") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&sort=ASC") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }

                it("Should return 200 OK for blank page, size and sort") {
                    withTestApplicationForApi(messageQueryService, mockHttpClient) {
                        val response =
                            client.get("/v1/hentmeldinger?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10&page=&size=&sort=") {
                                header(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                            }
                        response.status shouldBe HttpStatusCode.OK
                    }
                }
            }
        },
    )

@OptIn(InternalAPI::class)
private fun <T> withTestApplicationForApi(
    messageQueryService: MessageQueryService,
    mockHttpClient: HttpClient,
    testBlock: suspend ApplicationTestBuilder.() -> T,
) = testApplication {
    application({
        install(ContentNegotiation) {
            jackson {
                registerModule(JavaTimeModule())
                registerKotlinModule()
            }
        }
        val env =
            Environment(
                emottakMonitorClientId = "clientId",
                databaseUrl = "http://localhost:8080",
                databasePrefix = "db",
                emottakFrontEndUrl = "http://localhost:8080",
                oidcWellKnownUriUrl = "https://sts.issuer.net/myid",
            )
        val path = "src/test/resources/jwkset.json"
        val uri = Paths.get(path).toUri().toURL()
        val jwkProvider = JwkProviderBuilder(uri).build()
        setupAuth(env, jwkProvider, "https://sts.issuer.net/myid")
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
                    hentMessageInfo(messageQueryService)
                    hentMessageInfoEbms(mockHttpClient)
                    hentCpaIdInfo(messageQueryService)
                    hentCpaIdInfoEbms(mockHttpClient)
                    hentEbMessageIdInfo(messageQueryService)
                    hentPartnerIdInfo(messageQueryService)
                    hentFeilstatistikk(messageQueryService)
                    hentRollerServicesAction(mockHttpClient)
                    hentSistBrukt(messageQueryService, mockHttpClient)
                }
            }
        }
    })
    testBlock()
}
