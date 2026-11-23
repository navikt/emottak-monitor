package no.nav.emottak.configuration

import no.nav.emottak.utils.config.Kafka
import no.nav.emottak.utils.config.Port
import org.apache.kafka.clients.CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG
import org.apache.kafka.clients.CommonClientConfigs.SECURITY_PROTOCOL_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_KEYSTORE_TYPE_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG
import org.apache.kafka.common.config.SslConfigs.SSL_TRUSTSTORE_TYPE_CONFIG
import java.util.Properties

data class Config(
    val application: Application,
    val database: Database,
    val backendEndpoints: BackendEndpoints,
    val kafka: Kafka,
    val retryConsumer: RetryConsumer,
    val isDevelopment: Boolean,
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

data class RetryConsumer(
    val active: Boolean,
    val retryTopic: String,
    val consumerGroupId: String,
    val maxMessages: Int = 1000,
    val readTimeoutSeconds: Long = 30,
) {
    init {
        require(maxMessages > 0) { "retryConsumer.maxMessages must be positive" }
        require(readTimeoutSeconds in 1..60) { "retryConsumer.readTimeoutSeconds must be between 1 and 60" }
    }
}

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

fun Kafka.toProperties() =
    Properties()
        .apply {
            put(BOOTSTRAP_SERVERS_CONFIG, bootstrapServers)
            put(SECURITY_PROTOCOL_CONFIG, securityProtocol.value)
            put(SSL_KEYSTORE_TYPE_CONFIG, keystoreType.value)
            put(SSL_KEYSTORE_LOCATION_CONFIG, keystoreLocation.value)
            put(SSL_KEYSTORE_PASSWORD_CONFIG, keystorePassword.value)
            put(SSL_TRUSTSTORE_TYPE_CONFIG, truststoreType.value)
            put(SSL_TRUSTSTORE_LOCATION_CONFIG, truststoreLocation.value)
            put(SSL_TRUSTSTORE_PASSWORD_CONFIG, truststorePassword.value)
        }
