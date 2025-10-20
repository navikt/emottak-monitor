package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.CpaListe
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentCpaliste(
    databasePrefix: String,
): List<CpaListe> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT PARTNER_CPA.CPA_ID, PARTNER_CPA.PARTNER_ID, PARTNER_CPA.NAV_CPP_ID, PARTNER_CPA.PARTNER_CPP_ID, PARTNER_CPA.PARTNER_SUBJECTDN, 
                    PARTNER_CPA.PARTNER_ENDPOINT, PARTNER_CPA.LASTUSED
                   FROM $databasePrefix.PARTNER_CPA
                """,
        )
        statement.use {
            it.executeQuery().toList { toCpaliste() }
        }
    }

fun ResultSet.toCpaliste(): CpaListe =
    CpaListe(
        getString("CPA_ID"),
        getString("PARTNER_ID"),
        getString("NAV_CPP_ID"),
        getString("PARTNER_CPP_ID"),
        getString("PARTNER_SUBJECTDN"),
        getString("PARTNER_ENDPOINT"),
        getString("LASTUSED"),
    )
