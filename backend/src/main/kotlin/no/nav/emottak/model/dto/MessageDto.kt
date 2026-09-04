package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.Page

@Serializable
data class MessageDto(
    val receivedDate: String,
    val readableIdList: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referenceParameter: String? = null,
    val senderName: String? = null,
    val cpaId: String? = null,
    val count: Int,
    val status: String? = null,
    val readableId: String,
)

fun String.toPageMessageInfo(): Page<MessageInfo> {
    val decodedResponse = Json.decodeFromString<Page<MessageDto>>(this)
    val messageInfoList =
        decodedResponse.content.map { messageDto ->
            MessageInfo(
                datomottat = messageDto.receivedDate,
                mottakid = messageDto.readableId,
                conversationId = "", // Ikke i bruk for AssociatedMessages
                role = messageDto.role,
                service = messageDto.service,
                action = messageDto.action,
                referanse = messageDto.referenceParameter,
                avsender = messageDto.senderName,
                cpaid = messageDto.cpaId,
                antall = messageDto.count,
                status = messageDto.status,
            )
        }
    return Page(
        page = decodedResponse.page,
        size = decodedResponse.size,
        totalElements = decodedResponse.totalElements,
        sort = decodedResponse.sort,
        content = messageInfoList,
    )
}
