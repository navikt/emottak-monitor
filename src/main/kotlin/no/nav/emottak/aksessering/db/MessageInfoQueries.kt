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
                    SELECT ROLE, SERVICE, ACTION, MOTTAK_ID, DATOMOTTAT 
                    FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT >= to_timestamp('2020-03-23 00:01:00','YYYY-MM-DD HH24:MI:SS.FF')
                    AND DATOMOTTAT <= to_timestamp('2020-03-23 23:59:00','YYYY-MM-DD HH24:MI:SS.FF')
                """
            ).use {
                it.executeQuery().toList { toMeldingInfo() }
            }
        }

fun ResultSet.toMeldingInfo(): MeldingInfo =
        MeldingInfo(
                getString("ROLE"),
                getString("SERVICE"),
                getString("ACTION"),
                getString("MOTTAK_ID"),
                getString("DATOMOTTAT")
        )
