package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.nav.emottak.log
import no.nav.emottak.model.MottakIdInfo

@Serializable
data class ReadableIdDto(
    val receivedDate: String,
    val readableId: String,
    val requestId: String,
    val messageId: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referenceParameter: String? = null,
    val senderName: String? = null,
    val cpaId: String? = null,
    val status: String? = null,
    val conversationId: String,
)

fun String.toMottakIdInfo(): MottakIdInfo? {
    val messagelogList = Json.decodeFromString<List<ReadableIdDto>>(this)
    if (messagelogList.size != 1) {
        log.warn("Fikk ikke 1 ReadableIdDto-element tilbake, men {}!", messagelogList.size)
    }
    if (messagelogList.isEmpty()) {
        return null
    }
    return messagelogList[0].toMottakIdInfo()
}

fun ReadableIdDto.toMottakIdInfo(): MottakIdInfo =
    MottakIdInfo(
        datoMottatt = receivedDate,
        mottakId = readableId,
        requestId = requestId,
        role = role,
        service = service,
        action = action,
        refparam = referenceParameter,
        avsenderparam = senderName,
        cpaId = cpaId,
        status = status,
        conversationId = conversationId,
        messageId = messageId,
    )
