package no.nav.emottak

import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.PartnerCpaListe
import no.nav.emottak.model.PartnerCpaListeData

fun getMessages(): List<MessageInfo> = emptyList()

fun getMessageLogg(): List<MessageLoggInfo> = emptyList()

fun getMessageCpa(): List<MessageCPAInfo> = emptyList()

fun getMottakIdInfo(): List<MottakIdInfo> = emptyList()

fun getEBMessageIdInfo(): List<EBMessageIdInfo> = emptyList()

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
