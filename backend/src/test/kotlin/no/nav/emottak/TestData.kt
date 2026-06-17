package no.nav.emottak

import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.model.BehandlerInfo
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

fun getAbonnementListe(): AbonnementListeData =
    AbonnementListeData(
        abonnementListe =
            listOf(
                Abonnement(
                    partner_navn = "SERIALNUMBER=123456789, CN=Noe AS, O=Noe AS, C=NO",
                    partner_orgnr = "123456789",
                    partner_herid = "987654321",
                    endret_dato = "2014-11-19 14:13:39",
                    slutt_dato = null,
                    tssid = "80000654321",
                    BehandlerInfo = listOf(
                        BehandlerInfo(
                            B_FNavn = "Fornavn",
                            B_FamilieNavn = "Etternavn",
                            B_Hpr = "",
                            B_Herid = ""
                        )
                    ),
                    partner_id = "11111",
                    ab_id = 100
                ),
                Abonnement(
                    partner_navn = "SERIALNUMBER=123123123, CN=Noe AS, O=Noe AS, C=NO",
                    partner_orgnr = "123123123",
                    partner_herid = "987987987",
                    endret_dato = "2019-01-01 15:16:17",
                    slutt_dato = null,
                    tssid = "80000664422",
                    BehandlerInfo = listOf(
                        BehandlerInfo(
                            B_FNavn = "Mitt",
                            B_FamilieNavn = "Navn",
                            B_Hpr = "0101123",
                            B_Herid = ""
                        )
                    ),
                    partner_id = "22222",
                    ab_id = 200
                ),
                Abonnement(
                    partner_navn = "HELSEPLATTFORMEN AS TEST",
                    partner_orgnr = "922922922",
                    partner_herid = "81818181",
                    endret_dato = "2021-01-01 15:16:17",
                    slutt_dato = null,
                    tssid = "80000345678",
                    BehandlerInfo = listOf(
                        BehandlerInfo(
                            B_FNavn = "Ola",
                            B_FamilieNavn = "Normann",
                            B_Hpr = "9999999",
                            B_Herid = "8888888"
                        )
                    ),
                    partner_id = "33333",
                    ab_id = 3000
                ),
            ),
        totalNumberOfEntries = 3,
    )

