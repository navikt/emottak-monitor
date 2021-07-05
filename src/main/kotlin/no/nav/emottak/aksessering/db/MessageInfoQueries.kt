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
                    SELECT DATOMOTTAT, MOTTAK_ID, ROLE, SERVICE, ACTION, REFERANSEPARAM, EBCOMNAVN, CORRELATION_ID 
                    FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT between ? and ?
                    AND ROLE is not null
                    AND REFERANSEPARAM is not null
                    AND CORRELATION_ID is not null
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
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CORRELATION_ID")
    )
