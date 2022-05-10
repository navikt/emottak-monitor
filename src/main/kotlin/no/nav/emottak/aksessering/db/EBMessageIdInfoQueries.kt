package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.EBMessageIdInfo
import java.sql.ResultSet

fun DatabaseInterface.hentEBMessageIdInfo(
    databasePrefix: String,
    ebmessageid: String?,
): List<EBMessageIdInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, 
                    MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING 
                    WHERE MELDING.EBMESAGE_ID = ?
                """
        )
        statement.setObject(1, ebmessageid)
        statement.use {
            it.executeQuery().toList { toEBMessageIdInfo() }
        }
    }

fun ResultSet.toEBMessageIdInfo(): EBMessageIdInfo =
    EBMessageIdInfo(
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CPA_ID"),
        getString("STATUS")
    )
