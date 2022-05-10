package no.nav.emottak

import io.ktor.application.install
import io.ktor.features.CORS
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.routing.routing
import io.ktor.server.testing.TestApplicationEngine
import io.ktor.server.testing.handleRequest
import io.ktor.util.InternalAPI
import no.nav.emottak.application.ApplicationState
import no.nav.emottak.application.api.registerNaisApi
import org.amshove.kluent.shouldBeEqualTo
import org.amshove.kluent.shouldEqual
import org.junit.Test

internal class CORSTest {

    @InternalAPI
    @Test
    internal fun `No origin header`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                anyHost()
                allowCredentials = true
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(handleRequest(HttpMethod.Get, "/is_alive")) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo null
                response.content shouldBeEqualTo "I'm alive! :)"
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Wrong origin header`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                anyHost()
                allowCredentials = true
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Get, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "invalid-host")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo null
                response.content shouldBeEqualTo "I'm ready! :)"
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Wrong origin header is empty`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                anyHost()
                allowCredentials = true
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Get, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo null
                response.content shouldBeEqualTo "I'm ready! :)"
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Simple Request`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                host("syfosmmanuell.nais.preprod.local", schemes = listOf("http", "https"))
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Get, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo "https://syfosmmanuell.nais.preprod.local"
                response.content shouldBeEqualTo "I'm ready! :)"
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Simple Null`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                anyHost()
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Get, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "null")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo "*"
                response.content shouldBeEqualTo "I'm ready! :)"
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Pre flight custom host`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                host("syfosmmanuell.nais.preprod.local", schemes = listOf("http", "https"))
                allowNonSimpleContentTypes = true
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Options, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                    addHeader(HttpHeaders.AccessControlRequestMethod, "GET")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo "https://syfosmmanuell.nais.preprod.local"
                response.headers[HttpHeaders.AccessControlAllowHeaders] shouldBeEqualTo "Content-Type"
                response.headers[HttpHeaders.Vary] shouldBeEqualTo HttpHeaders.Origin
            }
        }
    }

    @InternalAPI
    @Test
    internal fun `Simple credentials`() {
        with(TestApplicationEngine()) {
            start()
            application.install(CORS) {
                anyHost()
                allowCredentials = true
            }
            val applicationState = ApplicationState()
            applicationState.ready = true
            applicationState.alive = true
            application.routing { registerNaisApi(applicationState) }

            with(
                handleRequest(HttpMethod.Options, "/is_ready") {
                    addHeader(HttpHeaders.Origin, "https://syfosmmanuell.nais.preprod.local")
                    addHeader(HttpHeaders.AccessControlRequestMethod, "GET")
                }
            ) {
                response.status() shouldBeEqualTo HttpStatusCode.OK
                response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBeEqualTo "https://syfosmmanuell.nais.preprod.local"
                response.headers[HttpHeaders.Vary] shouldBeEqualTo HttpHeaders.Origin
                response.headers[HttpHeaders.AccessControlAllowCredentials] shouldBeEqualTo "true"
            }
        }
    }
}
