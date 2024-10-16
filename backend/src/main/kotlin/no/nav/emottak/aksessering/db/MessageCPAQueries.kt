package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageCPAInfo
import java.sql.ResultSet

fun DatabaseInterface.getMessageCPA(
    databasePrefix: String,
    cpaid: String?,
): List<MessageCPAInfo> =
    connection.use { connection ->
        val statement =
            connection.prepareStatement(
                """
                SELECT PARTNER.PARTNER_ID, PARTNER.NAVN, PARTNER.HER_ID, PARTNER.ORGNUMMER 
                FROM $databasePrefix.PARTNER_CPA, $databasePrefix.PARTNER 
                WHERE PARTNER.PARTNER_ID = PARTNER_CPA.PARTNER_ID
                AND PARTNER_CPA.CPA_ID = ?
                """,
            )
        statement.setObject(1, cpaid)
        statement.use {
            it.executeQuery().toList { toMessageCPAInfo() }
        }
    }

fun ResultSet.toMessageCPAInfo(): MessageCPAInfo =
    MessageCPAInfo(
        getString("PARTNER_ID"),
        getString("NAVN"),
        getString("HER_ID"),
        getString("ORGNUMMER"),
    )
