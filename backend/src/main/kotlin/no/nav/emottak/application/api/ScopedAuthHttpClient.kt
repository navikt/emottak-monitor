package no.nav.emottak.application.api

import com.nimbusds.jwt.SignedJWT
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import no.nav.emottak.getEnvVar
import no.nav.emottak.log
import java.net.InetSocketAddress
import java.net.Proxy
import java.net.URI

const val AZURE_AD_AUTH = "AZURE_AD"
val LENIENT_JSON_PARSER =
    Json {
        isLenient = true
    }

private const val APP_NAME = "emottak-event-manager"
private const val APP_SCOPE_PROPERTY = "EMOTTAK_EVENT_MANAGER_SCOPE"

fun getScope(): String =
    getEnvVar(
        APP_SCOPE_PROPERTY,
        "api://${getEnvVar("NAIS_CLUSTER_NAME", "dev-fss")}.team-emottak.$APP_NAME/.default",
    )

private fun proxiedHttpClient() =
    HttpClient(CIO) {
        engine {
            val httpProxyUrl = getEnvVar("HTTP_PROXY", "")
            if (httpProxyUrl.isNotBlank()) {
                proxy =
                    Proxy(
                        Proxy.Type.HTTP,
                        InetSocketAddress(URI(httpProxyUrl).toURL().host, URI(httpProxyUrl).toURL().port),
                    )
            }
        }
    }

fun scopedAuthHttpClient(scope: String): () -> HttpClient =
    {
        HttpClient(CIO) {
            expectSuccess = true
            install(ContentNegotiation) {
                json()
            }
            install(Auth) {
                bearer {
                    refreshTokens {
                        proxiedHttpClient()
                            .post(
                                getEnvVar(
                                    "AZURE_OPENID_CONFIG_TOKEN_ENDPOINT",
                                    "http://localhost:3344/$AZURE_AD_AUTH/token",
                                ),
                            ) {
                                headers {
                                    header("Content-Type", "application/x-www-form-urlencoded")
                                }
                                val request =
                                    "client_id=" + getEnvVar("AZURE_APP_CLIENT_ID", "dummyclient") +
                                        "&client_secret=" + getEnvVar("AZURE_APP_CLIENT_SECRET", "dummysecret") +
                                        "&scope=" + scope +
                                        "&grant_type=client_credentials"
                                log.info("Autentiserings server URL: ${getEnvVar("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT")}")
                                log.info("Autentiserings forespørsel: $request")

                                setBody(request)
                            }.bodyAsText()
                            .let { tokenResponseString ->
                                log.info("The token response string we received was: $tokenResponseString")
                                SignedJWT.parse(
                                    LENIENT_JSON_PARSER.decodeFromString<Map<String, String>>(
                                        tokenResponseString,
                                    )["access_token"] as String,
                                )
                            }.let { parsedJwt ->
                                log.info("After parsing it, we got: $parsedJwt")
                                BearerTokens(parsedJwt.serialize(), "refresh token is unused")
                            }
                    }
                    sendWithoutRequest {
                        true
                    }
                }
            }
        }
    }
