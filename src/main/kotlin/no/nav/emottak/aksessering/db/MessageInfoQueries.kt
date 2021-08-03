package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MeldingInfo
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<MeldingInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, 
                    MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN,
                    (SELECT COUNT(*) FROM $databasePrefix.LOGG WHERE (MELDING.MOTTAK_ID = LOGG.MOTTAK_ID)) AS ANTALL, 
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS,
                    (SELECT PARTNER_CPA.CPA_ID FROM $databasePrefix.PARTNER_CPA, $databasePrefix.ABONNEMENT 
                    WHERE ABONNEMENT.PARTNER_ID = PARTNER_CPA.PARTNER_ID AND MELDING.MOTTAK_ID = ABONNEMENT.MOTTAK_ID) AS CPA
                    FROM $databasePrefix.MELDING 
                    WHERE MELDING.DATOMOTTAT BETWEEN ? AND ?
                """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toMeldingInfo() }
        }
    }

fun ResultSet.toMeldingInfo(): MeldingInfo =
    MeldingInfo(
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CPA"),
        getInt("ANTALL"),
        getString("STATUS")
    )
