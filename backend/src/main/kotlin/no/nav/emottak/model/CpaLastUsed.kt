package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class CpaLastUsed(
    val cpaId: String,
    var lastUsed: String?,
    var lastUsedEbms: String?,
)
