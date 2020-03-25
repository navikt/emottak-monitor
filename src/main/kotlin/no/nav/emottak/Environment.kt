package no.nav.emottak

data class Environment(

    val applicationPort: Int = getEnvVar("APPLICATION_PORT", "8080").toInt(),
    val applicationThreads: Int = getEnvVar("APPLICATION_THREADS", "1").toInt(),
    val applicationName: String = getEnvVar("NAIS_APP_NAME", "emottak-admin"),
    val aadAccessTokenUrl: String = getEnvVar("AADACCESSTOKEN_URL"),
    val aadDiscoveryUrl: String = getEnvVar("AADDISCOVERY_URL"),
    val jwkKeysUrl: String = getEnvVar("JWKKEYS_URL", "https://login.microsoftonline.com/common/discovery/keys"),
    val jwtIssuer: String = getEnvVar("JWT_ISSUER"),
    val clientId: String = getEnvVar("CLIENT_ID"),
    val databaseUrl: String = getEnvVar("DATABASE_URL"),
    val databasePrefix: String = getEnvVar("DATABASE_PREFIX"),
    val appIds: List<String> = getEnvVar("ALLOWED_APP_IDS", "")
        .split(",")
        .map { it.trim() }
)

data class VaultCredentials(
    val databaseUsername: String,
    val databasePassword: String

)

fun getEnvVar(varName: String, defaultValue: String? = null) =
    System.getenv(varName) ?: defaultValue ?: throw RuntimeException("Missing required variable \"$varName\"")
