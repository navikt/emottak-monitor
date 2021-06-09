package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MeldingInfo
import java.sql.ResultSet
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<MeldingInfo> =
    connection.use { connection ->
        connection.prepareStatement(
            """
                    SELECT ROLE, SERVICE, ACTION, MOTTAK_ID, DATOMOTTAT 
                    FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT >= to_timestamp('2021-01-201 09:06:00','YYYY-MM-DD HH24:MI:SS.FF')
                    AND DATOMOTTAT <= to_timestamp('2021-01-01 09:16:10','YYYY-MM-DD HH24:MI:SS.FF')"""
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
