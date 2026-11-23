package no.nav.emottak

import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.model.BehandlerInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLogInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.PartnerCpaListe
import no.nav.emottak.model.PartnerCpaListeData
import no.nav.emottak.model.RetryMessage
import no.nav.emottak.model.RetryMessageData
import no.nav.emottak.model.dto.FindByUuidResponseDto
import no.nav.emottak.model.dto.ReadableIdDto
import no.nav.emottak.utils.common.parseOrGenerateUuid
import kotlin.uuid.Uuid

fun getMessages(): List<MessageInfo> = emptyList()

fun getEvents(): List<HendelseInfo> = emptyList()

fun getMessageLogg(): List<MessageLogInfo> = emptyList()

fun getMessageCpa(): List<MessageCPAInfo> = emptyList()

fun getMottakIdInfo(): List<MottakIdInfo> =
    listOf(
        MottakIdInfo(
            datoMottatt = "2026-08-20 12:13:14",
            mottakId = "123456789012345678901",
        ),
    )

fun getFeilStatistikkInfo(): List<FeilStatistikkInfo> = emptyList()

fun getCPAListe(): PartnerCpaListeData =
    PartnerCpaListeData(
        partnerCpaListe =
            listOf(
                PartnerCpaListe(
                    partnerName = "partnerName1",
                    partnerSubjectDN = "partner1",
                    partnerID = "partnerId1",
                    herID = "herId1",
                    orgNummer = "orgNr1",
                    cpaID = "nav:qass:25695",
                    navCppID = "navCppId1",
                    partnerCppID = "adminbruker",
                    partnerEndpoint = "partnerEndpoint1",
                    komSystem = "komSystem1",
                    lastUsed = "2025-11-25 07:30:48",
                    lastUsedEbms = null,
                ),
                PartnerCpaListe(
                    partnerName = "partnerName2",
                    partnerSubjectDN = "partner2",
                    partnerID = "partnerId2",
                    herID = "herId2",
                    orgNummer = "orgNr2",
                    cpaID = "nav:qass:30358",
                    navCppID = "navCppId2",
                    partnerCppID = "adminbruker",
                    partnerEndpoint = "partnerEndpoint2",
                    komSystem = "komSystem2",
                    lastUsed = "2025-11-22 22:57:20",
                    lastUsedEbms = null,
                ),
            ),
        totalNumberOfEntries = 432,
    )

fun getAbonnementListe(): AbonnementListeData =
    AbonnementListeData(
        abonnementListe =
            listOf(
                Abonnement(
                    partnerNavn = "SERIALNUMBER=123456789, CN=Noe AS, O=Noe AS, C=NO",
                    partnerOrgnr = "123456789",
                    partnerHerId = "987654321",
                    endretDato = "2014-11-19 14:13:39",
                    sluttDato = null,
                    tssId = "80000654321",
                    behandlerInfo =
                        BehandlerInfo(
                            fornavn = "Fornavn",
                            etternavn = "Etternavn",
                            hpr = "",
                            herId = "",
                        ),
                    partnerId = "11111",
                    abId = 100,
                ),
                Abonnement(
                    partnerNavn = "SERIALNUMBER=123123123, CN=Noe AS, O=Noe AS, C=NO",
                    partnerOrgnr = "123123123",
                    partnerHerId = "987987987",
                    endretDato = "2019-01-01 15:16:17",
                    sluttDato = null,
                    tssId = "80000664422",
                    behandlerInfo =
                        BehandlerInfo(
                            fornavn = "Mitt",
                            etternavn = "Navn",
                            hpr = "0101123",
                            herId = "",
                        ),
                    partnerId = "22222",
                    abId = 200,
                ),
                Abonnement(
                    partnerNavn = "HELSEPLATTFORMEN AS TEST",
                    partnerOrgnr = "922922922",
                    partnerHerId = "81818181",
                    endretDato = "2021-01-01 15:16:17",
                    sluttDato = null,
                    tssId = "80000345678",
                    behandlerInfo =
                        BehandlerInfo(
                            fornavn = "Ola",
                            etternavn = "Normann",
                            hpr = "9999999",
                            herId = "8888888",
                        ),
                    partnerId = "33333",
                    abId = 3000,
                ),
            ),
        totalNumberOfEntries = 3,
    )

fun getRetryMessages(ids: List<String> = listOf(Uuid.random().toString())) =
    RetryMessageData(
        retryMessages =
            ids.map { id ->
                RetryMessage(
                    requestId = id,
                    timestamp = "123456789",
                    senderAddress = "senderAddress",
                    retryCount = "2",
                    retryReason = "reason",
                    retryableAfter = "2026-11-18T12:00:00",
                )
            },
        warning = null,
    )

fun getBulkMessageDetails(ids: List<String> = listOf(Uuid.random().toString())): FindByUuidResponseDto<ReadableIdDto> {
    var counter = 0
    return FindByUuidResponseDto(
        content =
            ids.associate { id ->
                counter++
                val uuid = id.parseOrGenerateUuid()
                uuid to createReadableIdDto(id, "IN.$counter")
            },
        invalidIds = emptyList(),
    )
}

fun createReadableIdDto(
    id: String,
    readableId: String,
) = ReadableIdDto(
    receivedDate = "2026-11-18T11:00:00Z",
    readableId = readableId,
    requestId = id,
    messageId = "message-id",
    conversationId = "conversation-id",
    role = "role",
    service = "service",
    action = "action",
    referenceParameter = "reference",
    senderName = "sender-name",
    cpaId = "cpa-id",
    status = "status",
)
