package no.nav.emottak

import no.nav.emottak.model.CpaIdInfo
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

fun getLastUsed(): Map<String, String?> =
    mapOf(
        "nav:qass:25695" to "2025-11-25 07:30:48",
        "nav:qass:30358" to "2025-11-22 07:57:20",
    )
