package no.nav.emottak.application

import com.auth0.jwk.JwkProvider
import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.auth.Authentication
import io.ktor.auth.Principal
import io.ktor.auth.jwt.JWTCredential
import io.ktor.auth.jwt.JWTPrincipal
import io.ktor.auth.jwt.jwt
import net.logstash.logback.argument.StructuredArguments
import no.nav.emottak.Environment
import no.nav.emottak.log

fun Application.setupAuth(
    env: Environment,
    jwkProvider: JwkProvider,
    issuer: String
) {
    install(Authentication) {
        jwt(name = "jwt") {
            verifier(jwkProvider, issuer)
            validate { credentials ->
                when {
                    hasEmottakAdminClientIdAudience(credentials, env) -> JWTPrincipal(credentials.payload)
                    else -> {
                        unauthorized(credentials)
                    }
                }
            }
        }
    }
}

fun unauthorized(credentials: JWTCredential): Principal? {
    log.warn(
        "Auth: Unexpected audience for jwt {}, {}",
        StructuredArguments.keyValue("issuer", credentials.payload.issuer),
        StructuredArguments.keyValue("audience", credentials.payload.audience)
    )
    return null
}

fun hasEmottakAdminClientIdAudience(credentials: JWTCredential, env: Environment): Boolean {
    return credentials.payload.audience.contains(env.emottakMonitorClientId)
}
