package no.nav.emottak.application.api

import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.http.headersOf
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import org.junit.jupiter.api.Test

@OptIn(InternalAPI::class)
class CpaXmlApiTest {
    @Test
    fun returnsHtmlForEncodedCpaId() =
        testApplication {
            val cpaId = "nav:test/a+b&c"
            val html = "<html><body><h1>CPA</h1></body></html>"
            HttpClient(
                MockEngine { request ->
                    request.url.encodedPath shouldBe "/cpa/view"
                    request.url.parameters["id"] shouldBe cpaId
                    respond(html, headers = headersOf(HttpHeaders.ContentType, ContentType.Text.Html.toString()))
                },
            ).use { upstream ->
                application {
                    routing {
                        route("/v1") {
                            hentCpaxmlDetailEbms(upstream)
                        }
                    }
                }

                val response =
                    client.get("/v1/cpaxmldetail") {
                        url { parameters.append("cpaId", cpaId) }
                    }

                response.status shouldBe HttpStatusCode.OK
                response.contentType()?.withoutParameters() shouldBe ContentType.Text.Html
                response.bodyAsText() shouldBe html
            }
        }

    @Test
    fun preservesUpstreamErrorStatus() =
        testApplication {
            HttpClient(
                MockEngine {
                    respond("CPA not found", status = HttpStatusCode.NotFound)
                },
            ) {
                expectSuccess = true
            }.use { upstream ->
                application {
                    routing {
                        route("/v1") {
                            hentCpaxmlDetailEbms(upstream)
                        }
                    }
                }

                val response = client.get("/v1/cpaxmldetail?cpaId=missing")

                response.status shouldBe HttpStatusCode.NotFound
                response.bodyAsText() shouldBe "CPA not found"
            }
        }

    @Test
    fun rejectsMissingOrBlankCpaId() =
        testApplication {
            HttpClient(
                MockEngine { error("Missing CPA-id must not call cpa-repo") },
            ).use { upstream ->
                application {
                    routing {
                        route("/v1") {
                            hentCpaxmlDetailEbms(upstream)
                        }
                    }
                }

                for (query in listOf("", "?cpaId=", "?cpaId=%20")) {
                    val response = client.get("/v1/cpaxmldetail$query")

                    response.status shouldBe HttpStatusCode.BadRequest
                    response.bodyAsText() shouldBe "Mangler parameter: cpaId"
                }
            }
        }
}
