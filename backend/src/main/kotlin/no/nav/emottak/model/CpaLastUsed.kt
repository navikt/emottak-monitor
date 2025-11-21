package no.nav.emottak.model

data class CpaLastUsed(
    val cpaId: String,
    var lastUsed: String?,
    var lastUsedEbms: String?,
)
