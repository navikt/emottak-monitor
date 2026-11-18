package no.nav.emottak.configuration

import no.nav.emottak.utils.config.Port

data class Config(
    val application: Application,
    val database: Database,
    val isDevelopment: Boolean,
    val backendEndpoints: BackendEndpoints,
)

data class Application(
    val name: Name,
    val port: Port,
    val threads: NumberOfThreads,
    val emottakFrontEndUrl: Url,
    val oidcWellKnownUriUrl: Url,
    val emottakMonitorClientId: AzureApplicationId,
)

data class Database(
    val url: Url,
    val prefix: Prefix,
    val maximumPoolSize: PoolSize,
)

data class BackendEndpoints(
    val eventManagerUrl: Url,
    val cpaRepoUrl: Url,
)

@JvmInline
value class Name(
    val value: String,
)

@JvmInline
value class Url(
    val value: String,
)

@JvmInline
value class NumberOfThreads(
    val value: Int,
)

@JvmInline
value class AzureApplicationId(
    val value: String,
)

@JvmInline
value class Prefix(
    val value: String,
)

@JvmInline
value class PoolSize(
    val value: Int,
)
