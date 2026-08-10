package no.nav.emottak.model

data class MessageLogData(
    val meldingsdetaljer: MottakIdInfo?,
    val meldingslogg: List<MessageLogInfo>,
    val warning: String?,
)
