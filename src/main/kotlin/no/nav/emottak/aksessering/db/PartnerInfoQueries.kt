package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.PartnerIdInfo
import java.sql.ResultSet

fun DatabaseInterface.hentPartnerIdInfo(
    databasePrefix: String,
    partnerid: String?,
): List<PartnerIdInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT PARTNER.PARTNER_ID, PARTNER.NAVN, PARTNER.HER_ID, PARTNER.ORGNUMMER, PARTNER.KOMMUNIKASJONSSYSTEM_ID, KOMMUNIKASJONSSYSTEM.BESKRIVELSE 
                    FROM $databasePrefix.PARTNER, $databasePrefix.KOMMUNIKASJONSSYSTEM 
                    WHERE PARTNER.KOMMUNIKASJONSSYSTEM_ID = KOMMUNIKASJONSSYSTEM.KOMMUNIKASJONSSYSTEM_ID
                    AND PARTNER_ID like ?
                """
        )
        statement.setObject(1, partnerid)
        statement.use {
            it.executeQuery().toList { toPartnereIdInfo() }
        }
    }

fun ResultSet.toPartnereIdInfo(): PartnerIdInfo =
    PartnerIdInfo(
        getString("PARTNER_ID"),
        getString("NAVN"),
        getString("HER_ID"),
        getString("ORGNUMMER"),
        getString("KOMMUNIKASJONSSYSTEM_ID")
    )
