package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.nav.emottak.model.MessageLogInfo
import no.nav.emottak.model.convertStatus

@Serializable
private data class MessageLogDto(
    val eventDate: String,
    val eventDescription: String,
    val eventId: String,
    val eventData: String? = null,
    val eventStatus: String,
)

fun String.toMessageLogInfoList(): List<MessageLogInfo> =
    Json.decodeFromString<List<MessageLogDto>>(this).map {
        MessageLogInfo(
            hendelsesdato = it.eventDate,
            hendelsesbeskrivelse = it.eventDescription,
            hendelsesdetaljer = it.eventData,
            hendelsesid = it.eventId,
            statuslevel = convertStatus(it.eventStatus),
        )
    }
