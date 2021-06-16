package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MeldingInfo
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<MeldingInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT MOTTAK_ID, HENDELSEDATO, TILLEGSINFO 
                    FROM $databasePrefix.LOGG
                    WHERE HENDELSEDATO between ? and ?
                """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toMeldingInfo() }
        }
    }

fun ResultSet.toMeldingInfo(): MeldingInfo =
    MeldingInfo(
        getString("MOTTAK_ID"),
        getString("HENDELSEDATO"),
        getString("TILLEGSINFO")
    )
