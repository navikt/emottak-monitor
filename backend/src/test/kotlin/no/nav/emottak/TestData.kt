package no.nav.emottak

import no.nav.emottak.model.CpaIdInfo
import no.nav.emottak.model.CpaLastUsed
import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.PartnerIdInfo

fun getMessages(): List<MessageInfo> = emptyList()

fun getMessageLogg(): List<MessageLoggInfo> = emptyList()

fun getMessageCpa(): List<MessageCPAInfo> = emptyList()

fun getMottakIdInfo(): List<MottakIdInfo> = emptyList()

fun getEBMessageIdInfo(): List<EBMessageIdInfo> = emptyList()

fun getPartnerIdInfo(): List<PartnerIdInfo> = emptyList()

fun getCpaIdInfo(): List<CpaIdInfo> = emptyList()

fun getFeilStatistikkInfo(): List<FeilStatistikkInfo> = emptyList()

fun getLastUsed(): List<CpaLastUsed> = listOf(
    CpaLastUsed("nav:qass:25695", "2025-11-25", null),
    CpaLastUsed("nav:qass:30358", "2025-11-22", null),
)
