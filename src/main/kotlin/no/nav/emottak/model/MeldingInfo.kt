package no.nav.emottak.model

data class MeldingInfo(
    val datomottat: String,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referanse: String,
    val avsender: String,
    val cpaid: String
)
