package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.FeilStatistikkInfo
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentFeilStatistikk(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<FeilStatistikkInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                SELECT DISTINCT HENDELSE.HENDELSEDESKR, COUNT(*) AS ANTALL_FEIL 
                FROM $databasePrefix.LOGG, $databasePrefix.HENDELSE
                WHERE HENDELSE.DISPOSABLE = 0 AND HENDELSE.STATUSLEVEL = 30
                AND LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID
                AND LOGG.HENDELSEDATO BETWEEN ? AND ?
                GROUP BY HENDELSE.HENDELSEDESKR
                ORDER BY ANTALL_FEIL DESC
            """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toFeilStatikk() }
        }
    }

fun ResultSet.toFeilStatikk(): FeilStatistikkInfo =
    FeilStatistikkInfo(
        getString("HENDELSEDESKR"),
        getString("ANTALL_FEIL")
    )
