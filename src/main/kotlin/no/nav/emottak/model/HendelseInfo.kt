package no.nav.emottak.model

data class HendelseInfo(
    val hendelsedato: String,
    val hendelsedeskr: String,
    val tillegsinfo: String,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referanse: String? = null,
    val avsender: String? = null
)
