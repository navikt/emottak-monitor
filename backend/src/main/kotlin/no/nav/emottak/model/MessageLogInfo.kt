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
        "Meldingen er opprettet", "Opprettet", "0" -> "created"
        "Sendt til manuell behandling", "Manuell behandling", "15" -> "manual"
        "Advarsel under behandling", "Advarsel", "20" -> "warning"
        "Meldingen feilet under behandling", "Feil", "30" -> "error"
        "Fatal feil oppstod under behandling", "Fatal feil", "40" -> "fatal"
        "Meldingen er ferdigbehandlet", "Ferdigbehandlet", "50" -> "ok"
        else -> "info"
    }
