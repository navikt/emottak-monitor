package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getMessageCPA
import no.nav.emottak.aksessering.db.getMessageLogg
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.MeldingInfo
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageLoggInfo
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String
) {
    fun meldinger(fom: LocalDateTime, tom: LocalDateTime): List<MeldingInfo> =
        databaseInterface.hentMeldinger(databasePrefix, fom, tom)
    fun messagelogg(mottakid: String?): List<MessageLoggInfo> =
        databaseInterface.getMessageLogg(databasePrefix, mottakid)
    fun messagecpa(cpaid: String?): List<MessageCPAInfo> =
        databaseInterface.getMessageCPA(databasePrefix, cpaid)
}
