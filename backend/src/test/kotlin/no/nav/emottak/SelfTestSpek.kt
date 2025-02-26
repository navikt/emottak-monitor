package no.nav.emottak

import io.ktor.client.request.get
import io.ktor.client.statement.readRawBytes
import io.ktor.http.HttpStatusCode
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.utils.io.InternalAPI
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.api.registerNaisApi
import org.amshove.kluent.shouldBeEqualTo
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

@InternalAPI
object SelfTestSpek : Spek({

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
                response.status shouldBeEqualTo HttpStatusCode.OK
                String(response.readRawBytes()) shouldBeEqualTo "I'm alive! :)"
            }
        }
        it("Returns ok in is_ready") {
            testApplication {
                val applicationState = ApplicationState(true, true)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_ready")
                response.status shouldBeEqualTo HttpStatusCode.OK
                String(response.readRawBytes()) shouldBeEqualTo "I'm ready! :)"
            }
        }
    }
    describe("Unsuccessful liveness and readyness") {
        it("Returns internal server error when liveness check fails") {
            testApplication {
                val applicationState = ApplicationState(false, false)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_alive")
                response.status shouldBeEqualTo HttpStatusCode.InternalServerError
                String(response.readRawBytes()) shouldBeEqualTo "I'm dead x_x"
            }
        }

        it("Returns internal server error when readyness check fails") {
            testApplication {
                val applicationState = ApplicationState(false, false)
                setupHealthEndpoints(applicationState)
                val response = client.get("/is_ready")
                response.status shouldBeEqualTo HttpStatusCode.InternalServerError
                String(response.readRawBytes()) shouldBeEqualTo "Please wait! I'm not ready :("
            }
        }
    }
})
