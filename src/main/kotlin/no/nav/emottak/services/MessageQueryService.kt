package no.nav.syfo.services

import no.nav.syfo.aksessering.db.hentMeldinger
import no.nav.syfo.db.DatabaseInterface

class MessageQueryService(
    private val database: DatabaseInterface,
    private val databasePrefix: String
) {
    fun hentMeldinger(): List<MeldingInfo> =
        database.hentMeldinger(databasePrefix)
}
