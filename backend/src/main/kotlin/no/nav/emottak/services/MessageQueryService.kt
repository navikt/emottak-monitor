package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getMessageCPA
import no.nav.emottak.aksessering.db.getMessageLogg
import no.nav.emottak.aksessering.db.hentAbonnementListe
import no.nav.emottak.aksessering.db.hentEBMessageIdInfo
import no.nav.emottak.aksessering.db.hentFeilStatistikk
import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.aksessering.db.hentMottakIdInfo
import no.nav.emottak.aksessering.db.hentPartnerCpaListe
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.model.EBMessageIdInfo
import no.nav.emottak.model.FeilStatistikkInfo
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.MessageLogInfo
import no.nav.emottak.model.MottakIdInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.PartnerCpaListeData
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String,
    private val sqlTimeout: Int,
) {
    fun meldinger(
        fom: LocalDateTime,
        tom: LocalDateTime,
        mottakId: String? = null,
        cpaId: String? = null,
        messageId: String? = null,
        pageable: Pageable? = null,
    ): Page<MessageInfo> = databaseInterface.hentMeldinger(databasePrefix, sqlTimeout, fom, tom, mottakId, cpaId, messageId, pageable)

    fun hendelser(
        fom: LocalDateTime,
        tom: LocalDateTime,
        pageable: Pageable? = null,
    ): Page<HendelseInfo> = databaseInterface.hentHendelser(databasePrefix, sqlTimeout, fom, tom, pageable)

    fun messagelogg(mottakid: String?): List<MessageLogInfo> = databaseInterface.getMessageLogg(databasePrefix, sqlTimeout, mottakid)

    fun messagecpa(cpaid: String?): List<MessageCPAInfo> = databaseInterface.getMessageCPA(databasePrefix, sqlTimeout, cpaid)

    fun mottakid(mottakid: String?): List<MottakIdInfo> = databaseInterface.hentMottakIdInfo(databasePrefix, sqlTimeout, mottakid)

    fun ebmessageid(ebmessageid: String?): List<EBMessageIdInfo> = databaseInterface.hentEBMessageIdInfo(databasePrefix, sqlTimeout, ebmessageid)

    fun feilstatistikk(
        fom: LocalDateTime,
        tom: LocalDateTime,
    ): List<FeilStatistikkInfo> = databaseInterface.hentFeilStatistikk(databasePrefix, sqlTimeout, fom, tom)

    fun cpaliste(searchColmn: String): PartnerCpaListeData = databaseInterface.hentPartnerCpaListe(databasePrefix, sqlTimeout, searchColmn)

    fun partnerliste(searchColmn: String): PartnerCpaListeData =
        databaseInterface.hentPartnerCpaListe(databasePrefix, sqlTimeout, searchColmn, isPartner = true)

    fun abonnementListe(sok: String): AbonnementListeData = databaseInterface.hentAbonnementListe(databasePrefix, sqlTimeout, sok)
}
