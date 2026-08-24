package no.nav.emottak.model

data class MessageLogInfo(
    val hendelsesdato: String,
    val hendelsesbeskrivelse: String,
    val hendelsesdetaljer: String?,
    val hendelsesid: String,
    val statuslevel: String,
)
