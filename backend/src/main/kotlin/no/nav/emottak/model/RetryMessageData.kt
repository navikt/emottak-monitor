package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class RetryMessageData(
    val retryMessages: List<RetryMessage>,
    val warning: String? = null,
)
