package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageLoggInfo
import java.sql.ResultSet


fun DatabaseInterface.getMessageLogg(
    databasePrefix: String,
    mottakid: String?
): List<MessageLoggInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                SELECT LOGG.HENDELSEDATO, HENDELSE.HENDELSEDESKR, LOGG.HENDELSE_ID 
                FROM $databasePrefix.LOGG 
                INNER JOIN $databasePrefix.HENDELSE ON LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID 
                WHERE LOGG.MOTTAK_ID = ? ORDER BY LOGG.HENDELSEDATO DESC;
                """
        )
        statement.setObject(1, mottakid)
        statement.use {
            it.executeQuery().toList { toMessageLoggInfo() }
        }
    }

fun ResultSet.toMessageLoggInfo(): MessageLoggInfo =
    MessageLoggInfo(
        getString("HENDELSEDATO"),
        getString("HENDELSEDESKR"),
        getString("HENDELSE_ID")
    )