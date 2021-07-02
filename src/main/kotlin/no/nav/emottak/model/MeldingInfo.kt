package no.nav.emottak.model

data class MeldingInfo(
    val datomottat: String,
    val mottakid: String,
    val role: String?,
    val service: String?,
    val action: String?,
    val referanse: String
)
