package no.nav.emottak.services

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.hentMelinger

class MessageQueryService(
    private val database: DatabaseInterface,
    private val databasePrefix: String
) {
    fun hentMeldinger(): List<String> =
        database.hentMelinger(databasePrefix)
}
