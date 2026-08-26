package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageLogInfo
import java.sql.ResultSet

fun DatabaseInterface.getMessageLogg(
    databasePrefix: String,
    mottakid: String?,
): List<MessageLogInfo> =
    connection.use { connection ->
        val statement =
            connection.prepareStatement(
                """
                SELECT LOGG.HENDELSEDATO, HENDELSE.HENDELSEDESKR, LOGG.HENDELSE_ID, LOGG.TILLEGSINFO 
                FROM $databasePrefix.MELDING, $databasePrefix.LOGG, $databasePrefix.HENDELSE
                WHERE MELDING.MOTTAK_ID = LOGG.MOTTAK_ID AND LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID 
                AND LOGG.MOTTAK_ID = ? ORDER BY LOGG.HENDELSEDATO ASC
                """,
            )
        statement.setObject(1, mottakid)
        statement.use {
            it.executeQuery().toList { toMessageLoggInfo() }
        }
    }

fun ResultSet.toMessageLoggInfo(): MessageLogInfo =
    MessageLogInfo(
        getString("HENDELSEDATO"),
        getString("HENDELSEDESKR"),
        getString("TILLEGSINFO"),
        getString("HENDELSE_ID"),
    )
