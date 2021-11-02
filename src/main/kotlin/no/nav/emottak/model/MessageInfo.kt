package no.nav.emottak.model

data class MessageInfo(
    val datomottat: String,
    val mottakidliste: String,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referanse: String? = null,
    val avsender: String? = null,
    val cpaid: String? = null,
    val antall: Int,
    val status: String? = null
)
