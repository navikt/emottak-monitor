package no.nav.syfo.aksessering.db

import java.sql.ResultSet
import java.time.LocalDateTime
import no.nav.syfo.db.DatabaseInterface
import no.nav.syfo.db.toList
import no.nav.syfo.services.MeldingInfo

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<MeldingInfo> =
        connection.use { connection ->
            connection.prepareStatement("""
                    SELECT ROLE, SERVICE, ACTION, MOTTAK_ID, DATOMOTTAT 
                    FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT >= to_timestamp($fom)
                    AND DATOMOTTAT <= to_timestamp($tom)
                """).use {
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
