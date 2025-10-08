package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getMessageCPA
import no.nav.emottak.aksessering.db.getMessageLogg
import no.nav.emottak.aksessering.db.hentCpaIdInfo
import no.nav.emottak.aksessering.db.hentEBMessageIdInfo
import no.nav.emottak.aksessering.db.hentFeilStatistikk
import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.aksessering.db.hentMottakIdInfo
import no.nav.emottak.aksessering.db.hentPartnerIdInfo
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.CpaIdInfo
import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.PartnerIdInfo
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String,
) {
    fun meldinger(
        fom: LocalDateTime,
        tom: LocalDateTime,
        mottakId: String,
        cpaId: String,
        messageId: String,
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

    fun partnerid(partnerid: String?): List<PartnerIdInfo> = databaseInterface.hentPartnerIdInfo(databasePrefix, partnerid)

    fun cpaid(
        cpaid: String?,
        fom: LocalDateTime,
        tom: LocalDateTime,
    ): List<CpaIdInfo> = databaseInterface.hentCpaIdInfo(databasePrefix, cpaid, fom, tom)

    fun feilstatistikk(
        fom: LocalDateTime,
        tom: LocalDateTime,
    ): List<FeilStatistikkInfo> = databaseInterface.hentFeilStatistikk(databasePrefix, fom, tom)
}
