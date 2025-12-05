package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import java.sql.ResultSet

fun DatabaseInterface.hentSistBrukt(databasePrefix: String): Map<String, String?> =
    connection.use { connection ->
        val statement =
            connection.prepareStatement(
                """
                    SELECT PARTNER_CPA.CPA_ID, PARTNER_CPA.LASTUSED
                   FROM $databasePrefix.PARTNER_CPA
                   ORDER BY PARTNER_CPA.LASTUSED DESC NULLS LAST 
                """,
            )
        statement.use {
            it.executeQuery().toMap { toKeyValue() }
        }
    }

fun <K, V> ResultSet.toMap(mapper: ResultSet.() -> Pair<K, V?>): Map<K, V?> =
    mutableMapOf<K, V?>().apply {
        while (next()) {
            val (key, value) = mapper()
            this[key] = value
        }
    }

fun ResultSet.toKeyValue() = Pair(getString("CPA_ID"), getString("LASTUSED"))
