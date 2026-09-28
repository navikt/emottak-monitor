package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class MessageLogInfo(
    val hendelsesdato: String,
    val hendelsesbeskrivelse: String,
    val hendelsesdetaljer: String?,
    val hendelsesid: String,
    val statuslevel: String,
)

fun convertStatus(value: String?): String =
    when (value) {
        "Meldingen er ferdigbehandlet", "Ferdigbehandlet", "50" -> "ok"
        "Meldingen feilet under behandling", "Feil", "30" -> "error"
        else -> "info"
    }
