package no.nav.emottak

import com.auth0.jwk.JwkProviderBuilder
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.ktor.application.install
import io.ktor.auth.authenticate
import io.ktor.features.ContentNegotiation
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.jackson.jackson
import io.ktor.routing.routing
import io.ktor.server.testing.TestApplicationEngine
import io.ktor.server.testing.handleRequest
import io.ktor.util.InternalAPI
import io.mockk.mockk
import java.nio.file.Paths
import no.nav.emottak.application.api.registerMeldingerApi
import no.nav.emottak.application.setupAuth
import no.nav.emottak.services.MessageQueryService
import org.amshove.kluent.shouldBe
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

@InternalAPI
class MeldingerApiSpek : Spek({
    val messageQueryService: MessageQueryService = mockk()
    io.mockk.coEvery { messageQueryService.meldinger(any(), any()) } returns getMessages()
    fun withTestApplicationForApi(receiver: TestApplicationEngine, block: TestApplicationEngine.() -> Unit) {
        receiver.start()
        val environment = Environment(
            8080,
            jwtIssuer = "https://sts.issuer.net/myid",
            appIds = "2,3".split(","),
            clientId = "1",
            aadAccessTokenUrl = "",
            aadDiscoveryUrl = "",
            databaseUrl = "",
            databasePrefix = ""
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
        receiver.application.setupAuth(environment, jwkProvider)
        receiver.application.routing { authenticate { registerMeldingerApi(messageQueryService) } }

        return receiver.block()
    }

    describe("Validate meldinger with authentication") {
        withTestApplicationForApi(TestApplicationEngine()) {
            it("Should return 401 Unauthorized") {
                with(handleRequest(HttpMethod.Get, "/v1/hentmeldinger") {
                }) {
                    response.status() shouldBe HttpStatusCode.Unauthorized
                }
            }

            it("should return 200 OK") {
                with(
                    handleRequest(
                        HttpMethod.Get,
                        "/v1/hentmeldinger?fromDate=24-03-2020 10:10:10&toDate=24-03-2020 11:10:10"
                    ) {
                        addHeader(
                            "Authorization",
                            "Bearer ${genereateJWT("2", "1")}"
                        )
                    }) {
                    response.status() shouldBe HttpStatusCode.OK
                }
            }

            it("Should return 401 Unauthorized when appId not allowed") {
                with(handleRequest(HttpMethod.Get, "/v1/hentmeldinger") {
                    addHeader(
                        "Authorization",
                        "Bearer ${genereateJWT("5", "1")}"
                    )
                }) {
                    response.status() shouldBe HttpStatusCode.Unauthorized
                }
            }
        }
    }
})
