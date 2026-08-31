package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.nav.emottak.log
import no.nav.emottak.model.MottakIdInfo

@Serializable
private data class ReadableIdDto(
    val receivedDate: String,
    val readableId: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val referenceParameter: String? = null,
    val senderName: String? = null,
    val cpaId: String? = null,
    val status: String? = null,
)

fun String.toMottakIdInfo(): MottakIdInfo? {
    val messagelogList = Json.decodeFromString<List<ReadableIdDto>>(this)
    if (messagelogList.size != 1) {
        log.warn("Fikk ikke 1 ReadableIdDto-element tilbake, men {}!", messagelogList.size)
    }
    if (messagelogList.isEmpty()) {
        return null
    }
    val messagelog = messagelogList[0]
    return MottakIdInfo(
        datomottatt = messagelog.receivedDate,
        mottakid = messagelog.readableId,
        role = messagelog.role,
        service = messagelog.service,
        action = messagelog.action,
        referanse = messagelog.referenceParameter,
        avsender = messagelog.senderName,
        cpaid = messagelog.cpaId,
        status = messagelog.status,
    )
}
