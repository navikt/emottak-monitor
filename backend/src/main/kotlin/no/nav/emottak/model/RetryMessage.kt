package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class RetryMessage(
    val requestId: String,
    val timestamp: String, // TODO: Konverter til datetime i string-format?
    val senderAddress: String,
    val retryCount: String,
    val retryReason: String,
    val retryableAfter: String,
    val message: MottakIdInfo? = null,
)
