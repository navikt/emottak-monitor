package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getMessageCPA
import no.nav.emottak.aksessering.db.getMessageLogg
import no.nav.emottak.aksessering.db.hentCpaIdInfo
import no.nav.emottak.aksessering.db.hentEBMessageIdInfo
import no.nav.emottak.aksessering.db.hentFeilStatistikk
import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.aksessering.db.hentMottakIdInfo
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.CpaIdInfo
import no.nav.emottak.model.EBMessageIdIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLoggInfo
import no.nav.emottak.model.MottakIdInfo
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String
) {
    fun meldinger(fom: LocalDateTime, tom: LocalDateTime): List<MessageInfo> =
        databaseInterface.hentMeldinger(databasePrefix, fom, tom)
    fun hendelser(fom: LocalDateTime, tom: LocalDateTime): List<HendelseInfo> =
        databaseInterface.hentHendelser(databasePrefix, fom, tom)
    fun messagelogg(mottakid: String?): List<MessageLoggInfo> =
        databaseInterface.getMessageLogg(databasePrefix, mottakid)
    fun messagecpa(cpaid: String?): List<MessageCPAInfo> =
        databaseInterface.getMessageCPA(databasePrefix, cpaid)
    fun mottakid(mottakid: String?): List<MottakIdInfo> =
        databaseInterface.hentMottakIdInfo(databasePrefix, mottakid)
    fun ebmessageid(ebmessageid: String?): List<EBMessageIdIdInfo> =
        databaseInterface.hentEBMessageIdInfo(databasePrefix, ebmessageid)
    fun cpaid(cpaid: String?, fom: LocalDateTime, tom: LocalDateTime): List<CpaIdInfo> =
        databaseInterface.hentCpaIdInfo(databasePrefix, cpaid, fom, tom)
    fun feilstatistikk(fom: LocalDateTime, tom: LocalDateTime): List<FeilStatistikkInfo> =
        databaseInterface.hentFeilStatistikk(databasePrefix, fom, tom)
}
