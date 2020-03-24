package no.nav.syfo.services

import java.time.LocalDateTime
import no.nav.syfo.aksessering.db.hentMeldinger
import no.nav.syfo.db.DatabaseInterface

class MessageQueryService(
    private val database: DatabaseInterface,
    private val databasePrefix: String
) {
    fun hentMeldinger(fom: LocalDateTime, tom: LocalDateTime): List<MeldingInfo> =
        database.hentMeldinger(databasePrefix, fom, tom)
}
