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
                    partnerNavn = "SERIALNUMBER=123456789, CN=Noe AS, O=Noe AS, C=NO",
                    partnerOrgnr = "123456789",
                    partnerHerId = "987654321",
                    endretDato = "2014-11-19 14:13:39",
                    sluttDato = null,
                    tssId = "80000654321",
                    behandlerInfo =
                        listOf(
                            BehandlerInfo(
                                fornavn = "Fornavn",
                                etternavn = "Etternavn",
                                hpr = "",
                                herId = "",
                            ),
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
                        listOf(
                            BehandlerInfo(
                                fornavn = "Mitt",
                                etternavn = "Navn",
                                hpr = "0101123",
                                herId = "",
                            ),
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
                        listOf(
                            BehandlerInfo(
                                fornavn = "Ola",
                                etternavn = "Normann",
                                hpr = "9999999",
                                herId = "8888888",
                            ),
                        ),
                    partnerId = "33333",
                    abId = 3000,
                ),
            ),
        totalNumberOfEntries = 3,
    )
