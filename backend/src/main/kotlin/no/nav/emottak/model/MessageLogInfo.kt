package no.nav.emottak.model

data class MessageLogInfo(
    val hendelsesdato: String,
    val hendelsesbeskrivelse: String,
    val hendelsesdetaljer: String?,
    val hendelsesid: String,
    val statuslevel: String,
)

fun convertStatus(value: String): String =
    when (value) {
        "Ferdigbehandlet", "50" -> "ok"
        "Feil", "30" -> "error"
        else -> "info"
    }
