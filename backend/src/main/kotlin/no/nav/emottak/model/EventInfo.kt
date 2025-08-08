package no.nav.emottak.model

data class EventInfo(
    val hendelsedato: String,
    val hendelsedeskr: String,
    val tillegsinfo: String,
    val requestid: String? = null,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referanse: String? = null,
    val avsender: String? = null,
)
