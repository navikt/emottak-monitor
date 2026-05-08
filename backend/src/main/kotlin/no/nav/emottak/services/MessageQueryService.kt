package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getMessageCPA
import no.nav.emottak.aksessering.db.getMessageLogg
import no.nav.emottak.aksessering.db.hentCpaliste
import no.nav.emottak.aksessering.db.hentEBMessageIdInfo
import no.nav.emottak.aksessering.db.hentFeilStatistikk
import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.aksessering.db.hentMottakIdInfo
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.CpaListeData
import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String,
) {
    fun meldinger(
        fom: LocalDateTime,
        tom: LocalDateTime,
        mottakId: String? = null,
        cpaId: String? = null,
        messageId: String? = null,
        pageable: Pageable? = null,
    ): Page<MessageInfo> = databaseInterface.hentMeldinger(databasePrefix, fom, tom, mottakId, cpaId, messageId, pageable)

    fun hendelser(
        fom: LocalDateTime,
        tom: LocalDateTime,
        pageable: Pageable? = null,
    ): Page<HendelseInfo> = databaseInterface.hentHendelser(databasePrefix, fom, tom, pageable)

    fun messagelogg(mottakid: String?): List<MessageLoggInfo> = databaseInterface.getMessageLogg(databasePrefix, mottakid)

    fun messagecpa(cpaid: String?): List<MessageCPAInfo> = databaseInterface.getMessageCPA(databasePrefix, cpaid)

    fun mottakid(mottakid: String?): List<MottakIdInfo> = databaseInterface.hentMottakIdInfo(databasePrefix, mottakid)

    fun ebmessageid(ebmessageid: String?): List<EBMessageIdInfo> = databaseInterface.hentEBMessageIdInfo(databasePrefix, ebmessageid)

    fun feilstatistikk(
        fom: LocalDateTime,
        tom: LocalDateTime,
    ): List<FeilStatistikkInfo> = databaseInterface.hentFeilStatistikk(databasePrefix, fom, tom)

    fun cpaliste(
        searchColmn: String?,
        hideUsedCpaMonths: Long = 0,
    ): CpaListeData = databaseInterface.hentCpaliste(databasePrefix, searchColmn.toString(), hideUsedCpaMonths)
}
