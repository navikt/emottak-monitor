package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.CpaIdInfo
import java.sql.ResultSet

fun DatabaseInterface.hentCpaIdInfo(
    databasePrefix: String,
    cpaid: String?
): List<CpaIdInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, 
                    MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING 
                    WHERE MELDING.AVTALE_ID = ?
                """
        )
        statement.setObject(1, cpaid)
        statement.use {
            it.executeQuery().toList { toCpaIdInfo() }
        }
    }

fun ResultSet.toCpaIdInfo(): CpaIdInfo =
    CpaIdInfo(
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
