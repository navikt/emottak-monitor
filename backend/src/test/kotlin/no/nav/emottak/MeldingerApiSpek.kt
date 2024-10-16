package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.routing
import io.ktor.server.testing.TestApplicationEngine
import io.ktor.server.testing.handleRequest
import io.ktor.util.InternalAPI
import io.mockk.mockk
import no.nav.emottak.application.api.registerMeldingerApi
import no.nav.emottak.application.setupAuth
import no.nav.emottak.services.MessageQueryService
import org.amshove.kluent.shouldBe
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.nio.file.Paths

@InternalAPI
class MeldingerApiSpek :
    Spek({
        val messageQueryService: MessageQueryService = mockk()
        io.mockk.coEvery { messageQueryService.meldinger(any(), any()) } returns getMessages()
        io.mockk.coEvery { messageQueryService.messagelogg(any()) } returns getMessageLogg()
        io.mockk.coEvery { messageQueryService.messagecpa(any()) } returns getMessageCpa()
        io.mockk.coEvery { messageQueryService.mottakid(any()) } returns getMottakIdInfo()
        io.mockk.coEvery { messageQueryService.partnerid(any()) } returns getPartnerIdInfo()
        io.mockk.coEvery { messageQueryService.ebmessageid(any()) } returns getEBMessageIdInfo()
        io.mockk.coEvery { messageQueryService.cpaid(any(), any(), any()) } returns getCpaIdInfo()
        io.mockk.coEvery { messageQueryService.feilstatistikk(any(), any()) } returns getFeilStatistikkInfo()

        fun withTestApplicationForApi(
            receiver: TestApplicationEngine,
            block: TestApplicationEngine.() -> Unit,
        ) {
            receiver.start()
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
            receiver.application.install(ContentNegotiation) {
                jackson {
                    registerModule(JavaTimeModule())
                    registerKotlinModule()
                }
            }
            receiver.application.setupAuth(env, jwkProvider, "https://sts.issuer.net/myid")
            receiver.application.routing {
                authenticate("jwt") {
                    registerMeldingerApi(messageQueryService)
                }
            }

            return receiver.block()
        }

        describe("Validate meldinger with authentication") {
            withTestApplicationForApi(TestApplicationEngine()) {
                it("Should return 401 Unauthorized") {
                    with(
                        handleRequest(HttpMethod.Get, "/v1/hentmeldinger") {
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.Unauthorized
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentmeldinger?fromDate=02-10-2021 10:10:10&toDate=03-10-2021 10:30:10",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentlogg?mottakId=123456789012345678901",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentcpa?cpaid=nav:qass:30823",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentmessageinfo?mottakId=123456789012345678901",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentcpaidinfo?cpaId=985033633_889640782_eResept&fromDate=28-04-2022 09:10:10&toDate=28-04-2022 10:00:10",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentebmessageidinfo?ebmessageId=20220428-090325-98770@qa.ebxml.nav.no",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentpartneridinfo?partnerId=18736",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
                it("Should return 401 Unauthorized when appId not allowed") {
                    with(
                        handleRequest(HttpMethod.Get, "/v1/hentmeldinger") {
                            addHeader(
                                "Authorization",
                                "Bearer ${generateJWT("5", "1")}",
                            )
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.Unauthorized
                    }
                }
                it("should return 200 OK") {
                    with(
                        handleRequest(
                            HttpMethod.Get,
                            "/v1/hentfeilstatistikk?fromDate=01-10-2021 10:10:10&toDate=03-10-2021 11:10:10",
                        ) {
                            addHeader(HttpHeaders.Authorization, "Bearer ${generateJWT("2", "clientId")}")
                        },
                    ) {
                        response.status() shouldBe HttpStatusCode.OK
                    }
                }
            }
        }
    })
