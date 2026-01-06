package no.nav.emottak

import no.nav.emottak.model.CpaIdInfo
import no.nav.emottak.model.CpaListe
import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.PartnerIdInfo

fun getMessages(): List<MessageInfo> = emptyList()

fun getMessageLogg(): List<MessageLoggInfo> = emptyList()

fun getMessageCpa(): List<MessageCPAInfo> = emptyList()

fun getMottakIdInfo(): List<MottakIdInfo> = emptyList()

fun getEBMessageIdInfo(): List<EBMessageIdInfo> = emptyList()

fun getPartnerIdInfo(): List<PartnerIdInfo> = emptyList()

fun getCpaIdInfo(): List<CpaIdInfo> = emptyList()

fun getFeilStatistikkInfo(): List<FeilStatistikkInfo> = emptyList()

fun getCPAListe(): Page<CpaListe> =
    Page(
        page = 0,
        size = 25,
        totalElements = 2,
        content =
            listOf(
                CpaListe(
                    "partner1",
                    "partnerId1",
                    "herId1",
                    "orgNr1",
                    "nav:qass:25695",
                    "navCppId1",
                    "adminbruker",
                    "partnerEndpoint1",
                    "komSystem1",
                    "2025-11-25 07:30:48",
                    null,
                ),
                CpaListe(
                    "partner2",
                    "partnerId2",
                    "herId2",
                    "orgNr2",
                    "nav:qass:30358",
                    "navCppId2",
                    "adminbruker",
                    "partnerEndpoint2",
                    "komSystem2",
                    "2025-11-22 07:57:20",
                    null,
                ),
            ),
    )
