package no.nav.emottak.model.dto

import kotlinx.serialization.json.Json
import no.nav.emottak.model.MottakIdInfo

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

fun String.toMottakIdInfo(): MottakIdInfo {
    val messagelog = Json.decodeFromString<ReadableIdDto>(this)
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
