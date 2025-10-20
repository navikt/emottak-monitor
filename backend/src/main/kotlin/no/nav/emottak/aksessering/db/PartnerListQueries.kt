package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.PartnerList
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentPartnerList(
    databasePrefix: String,
): List<PartnerList> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT PARTNER.PARTNER_ID,  PARTNER.NAVN, PARTNER.HER_ID, PARTNER.ORGNUMMER, KOMMUNIKASJONSSYSTEM.BESKRIVELSE
                   FROM $databasePrefix.PARTNER, $databasePrefix.KOMMUNIKASJONSSYSTEM WHERE PARTNER.KOMMUNIKASJONSSYSTEM_ID = KOMMUNIKASJONSSYSTEM.KOMMUNIKASJONSSYSTEM_ID
                """,
        )
        statement.use {
            it.executeQuery().toList { toPartnerlist() }
        }
    }

fun ResultSet.toPartnerlist(): PartnerList =
    PartnerList(
        getString("PARTNER_ID"),
        getString("NAVN"),
        getString("HER_ID"),
        getString("ORGNUMMER"),
        getString("BESKRIVELSE")
    )
