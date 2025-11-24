package no.nav.emottak

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.statement.readRawBytes
import io.ktor.http.HttpStatusCode
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.api.registerNaisApi

@InternalAPI
object SelfTestSpek : DescribeSpec({

    fun ApplicationTestBuilder.setupHealthEndpoints(applicationState: ApplicationState) {
        application {
            routing {
                registerNaisApi(
                    applicationState = applicationState,
                )
            }
        }
    }

    describe("Successfull liveness and readyness tests") {

        it("Returns ok on is_alive") {
            testApplication {
                val applicationState = ApplicationState(true, true)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_alive")
                response.status shouldBe HttpStatusCode.OK
                String(response.readRawBytes()) shouldBe "I'm alive! :)"
            }
        }

        it("Returns ok in is_ready") {
            testApplication {
                val applicationState = ApplicationState(true, true)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_ready")
                response.status shouldBe HttpStatusCode.OK
                String(response.readRawBytes()) shouldBe "I'm ready! :)"
            }
        }
    }

    describe("Unsuccessful liveness and readyness") {

        it("Returns internal server error when liveness check fails") {
            testApplication {
                val applicationState = ApplicationState(false, false)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_alive")
                response.status shouldBe HttpStatusCode.InternalServerError
                String(response.readRawBytes()) shouldBe "I'm dead x_x"
            }
        }

        it("Returns internal server error when readyness check fails") {
            testApplication {
                val applicationState = ApplicationState(false, false)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_ready")
                response.status shouldBe HttpStatusCode.InternalServerError
                String(response.readRawBytes()) shouldBe "Please wait! I'm not ready :("
            }
        }
    }
})
