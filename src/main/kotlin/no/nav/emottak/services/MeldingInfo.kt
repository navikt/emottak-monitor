package no.nav.emottak.services
data class MeldingInfo(
    val role: String,
    val service: String,
    val action: String,
    val mottakid: String,
    val datomottak: String
)
