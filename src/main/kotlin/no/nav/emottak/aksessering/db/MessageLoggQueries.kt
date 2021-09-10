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
                FROM $databasePrefix.MELDING, $databasePrefix.LOGG, $databasePrefix.HENDELSE
                WHERE MELDING.MOTTAK_ID = LOGG.MOTTAK_ID AND LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID 
                AND LOGG.MOTTAK_ID = ? ORDER BY LOGG.HENDELSEDATO ASC
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