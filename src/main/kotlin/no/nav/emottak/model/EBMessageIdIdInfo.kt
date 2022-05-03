package no.nav.emottak.model

data class EBMessageIdIdInfo(
    val datomottat: String,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referanse: String? = null,
    val avsender: String? = null,
    val cpaid: String? = null,
    val status: String? = null
)
