package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.CpaLastUsed
import java.sql.ResultSet

fun DatabaseInterface.hentSistBrukt(databasePrefix: String): List<CpaLastUsed> =
    connection.use { connection ->
        val statement =
            connection.prepareStatement(
                """
                    SELECT PARTNER_CPA.CPA_ID, PARTNER_CPA.LASTUSED
                   FROM $databasePrefix.PARTNER_CPA
                   ORDER BY PARTNER_CPA.LASTUSED DESC
                """,
            )
        statement.use {
            it.executeQuery().toList { toCpaLastUsed() }
        }
    }

fun ResultSet.toCpaLastUsed(): CpaLastUsed =
    CpaLastUsed(
        getString("CPA_ID"),
        getString("LASTUSED")?.split(" ")[0],
        null,
    )
