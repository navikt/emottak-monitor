package no.nav.emottak

data class Environment(

    val applicationPort: Int = getEnvVar("APPLICATION_PORT", "8080").toInt(),
    val applicationThreads: Int = getEnvVar("APPLICATION_THREADS", "1").toInt(),
    val applicationName: String = getEnvVar("NAIS_APP_NAME", "admin-appen"),
    val aadAccessTokenUrl: String = getEnvVar("AADACCESSTOKEN_URL", ""),
    val aadDiscoveryUrl: String = getEnvVar("AADDISCOVERY_URL", ""),
    val jwkKeysUrl: String = getEnvVar("JWKKEYS_URL", "https://login.microsoftonline.com/common/discovery/keys"),
    val jwtIssuer: String = getEnvVar("JWT_ISSUER", ""),
    val clientId: String = getEnvVar("CLIENT_ID", ""),
    val databaseUrl: String = getEnvVar("DATABASE_URL", "jdbc:oracle:thin:@a01dbfl033.adeo.no:1521/emottak_q1"),
    val databasePrefix: String = getEnvVar("DATABASE_PREFIX", "emottak_q1"),
    val databaseUsername: String = getEnvVar("USERNAME", "nmt3"),
    val databasePassword: String = getEnvVar("PASSWORD", "nmt3oracle11"),
    val appIds: List<String> = getEnvVar("ALLOWED_APP_IDS", "")
        .split(",").map { it.trim() }
)

data class VaultCredentials(
    val serviceuserUsername: String,
    val serviceuserPassword: String,
    val databaseUsername: String,
    val databasePassword: String

)

fun getEnvVar(varName: String, defaultValue: String? = null) =
    System.getenv(varName) ?: defaultValue ?: throw RuntimeException("Missing required variable \"$varName\"")
