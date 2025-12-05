package no.nav.emottak

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.readRawBytes
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.api.registerNaisApi

@InternalAPI
object CORSTest : DescribeSpec(
    {

        fun ApplicationTestBuilder.setupHealthEndpoints(applicationState: ApplicationState) {
            application {
                routing {
                    registerNaisApi(
                        applicationState = applicationState,
                    )
                }
            }
        }
        describe("Successfull liveness, No origin header") {
            it("Returns ok on is_alive") {
                testApplication {
                    install(CORS) {
                        anyHost()
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_alive")
                    response.status shouldBe HttpStatusCode.OK
                    response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe null
                    String(response.readRawBytes()) shouldBe "I'm alive! :)"
                }
            }
        }
        describe("Successfull readiness, wrong origin header") {
            it("Returns ok on is_ready") {
                testApplication {
                    install(CORS) {
                        anyHost()
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "invalid-host")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe null
                    String(response.readRawBytes()) shouldBe "I'm ready! :)"
                }
            }
        }
        describe("Successfull readiness, wrong origin header is empty") {
            it("Returns ok on is_ready") {
                testApplication {
                    install(CORS) {
                        anyHost()
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe null
                    String(response.readRawBytes()) shouldBe "I'm ready! :)"
                }
            }
        }
        describe("Simple request") {
            it("Returns ok on is_alive") {
                testApplication {
                    install(CORS) {
                        allowHost("syfosmmanuell.nais.preprod.local", schemes = listOf("http", "https"))
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe null
                }
            }
        }
        describe("Simple null") {
            it("Returns ok on is_alive") {
                testApplication {
                    install(CORS) {
                        anyHost()
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "null")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    String(response.readRawBytes()) shouldBe "I'm ready! :)"
                }
            }
        }
        describe("Pre flight custom host") {
            it("Returns ok on is_ready") {
                testApplication {
                    install(CORS) {
                        allowHost("syfosmmanuell.nais.preprod.local", schemes = listOf("http", "https"))
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    String(response.readRawBytes()) shouldBe "I'm ready! :)"
                }
            }
        }
        describe("Simple credentials") {
            it("Returns ok on is_ready") {
                testApplication {
                    install(CORS) {
                        anyHost()
                        allowCredentials = true
                    }
                    val applicationState = ApplicationState(true, true)
                    setupHealthEndpoints(applicationState)
                    val response = client.get("/is_ready")
                    client.get("/is_ready") {
                        header(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    String(response.readRawBytes()) shouldBe "I'm ready! :)"
                }
            }
        }
    },
)
