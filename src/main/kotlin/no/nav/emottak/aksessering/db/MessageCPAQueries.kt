package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageCPAInfo
import no.nav.emottak.model.MessageLoggInfo
import java.sql.ResultSet


fun DatabaseInterface.getMessageCPA(
    databasePrefix: String,
    cpaid: String?
): List<MessageCPAInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                SELECT PARTNER.PARTNER_ID, PARTNER.NAVN, PARTNER.HER_ID, PARTNER.ORGNUMMER 
                FROM PARTNER_CPA, PARTNER 
                WHERE PARTNER_CPA.PARTNER_ID = PARTNER.PARTNER_ID
                AND PARTNER_CPA.CPA_ID = ?
                """
        )
        statement.setObject(1, cpaid)
        statement.use {
            it.executeQuery().toList { toMessageCPAInfo() }
        }
    }

fun ResultSet.toMessageCPAInfo(): MessageCPAInfo =
    MessageCPAInfo(
        getString("PARTNERID"),
        getString("PARTNERHERID"),
        getString("PARTNERORGNUMMER")
    )