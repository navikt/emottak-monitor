package no.nav.syfo.aksessering.db

import java.sql.ResultSet
import no.nav.syfo.db.DatabaseInterface
import no.nav.syfo.db.toList
import no.nav.syfo.services.MeldingInfo

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String
): List<MeldingInfo> =
        connection.use { connection ->
            connection.prepareStatement(
                    """
                SELECT mottak_id FROM melding
                """
            ).use {
                it.executeQuery().toList { toMeldingInfo() }
            }
        }

fun ResultSet.toMeldingInfo(): MeldingInfo =
        MeldingInfo(
                getString("mottak_id")
        )
