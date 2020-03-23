package no.nav.syfo.services

data class MeldingInfo(
    val role: String,
    val service: String,
    val action: String,
    val mottakid: String,
    val datomottak: String
)
