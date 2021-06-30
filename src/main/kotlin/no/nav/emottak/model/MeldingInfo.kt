package no.nav.emottak.model

data class MeldingInfo(
    val role: String?,
    val service: String?,
    val action: String?,
    val mottakid: String,
    val datomottat: String
)
