package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageInfo
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    mottakId: String,
    cpaId: String,
    messageId: String,
): List<MessageInfo> {
    var sqlStatement = """
                    SELECT MELDING.DATOMOTTAT, (SELECT LISTAGG(MELDING2.MOTTAK_ID, ',') WITHIN GROUP(ORDER BY MELDING2.EBCONVERS_ID) 
                    FROM $databasePrefix.MELDING MELDING2
                    WHERE MELDING2.EBCONVERS_ID = MELDING.EBCONVERS_ID GROUP BY MELDING2.EBCONVERS_ID) AS MOTTAK_ID_LISTE,
                    MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT COUNT(*) FROM $databasePrefix.LOGG WHERE (MELDING.MOTTAK_ID = LOGG.MOTTAK_ID)) AS ANTALL,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING
                    WHERE MELDING.DATOMOTTAT BETWEEN ? AND ? AND MELDING.EBCONVERS_ID IS NOT NULL
                """
    if (mottakId != "") sqlStatement += " AND LOWER(MELDING.MOTTAK_ID) LIKE '%${mottakId.lowercase()}%'"
    if (cpaId != "") sqlStatement += " AND LOWER(MELDING.AVTALE_ID) LIKE '%${cpaId.lowercase()}%'"
    if (messageId != "") sqlStatement += " AND LOWER(MELDING.EBMESAGE_ID) LIKE '%${messageId.lowercase()}%'"
    return connection.use { connection ->
        val statement =
            connection.prepareStatement(sqlStatement)
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toMessageInfo() }
        }
    }
}

fun ResultSet.toMessageInfo(): MessageInfo =
    MessageInfo(
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID_LISTE"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CPA_ID"),
        getInt("ANTALL"),
        getString("STATUS"),
    )
