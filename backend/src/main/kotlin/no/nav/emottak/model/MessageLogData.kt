package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class MessageLogData(
    val meldingsdetaljer: MottakIdInfo?,
    val meldingslogg: List<MessageLogInfo>,
    val warning: String?,
)
