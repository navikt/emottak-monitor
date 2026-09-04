package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MottakIdInfo
import java.sql.ResultSet

fun DatabaseInterface.hentMottakIdInfo(
    databasePrefix: String,
    mottakid: String?,
): List<MottakIdInfo> =
    connection.use { connection ->
        val statement =
            connection.prepareStatement(
                """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, 
                    MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID, 
                    MELDING.MELDINGSPARAM, MELDING.REFERANSEPARAM, MELDING.AVSENDERPARAM,
                    MELDING.EBCONVERS_ID, MELDING.EBMESAGE_ID,
                    MELDING.CERTDN,
                    MELDING.TRUSTDN,
                    MELDING.DOCSIGNERDN,
                    MELDING.DOCSIGNERISSUERDN, 
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING 
                    WHERE MELDING.MOTTAK_ID = ?
                """,
            )
        statement.setObject(1, mottakid)
        statement.use {
            it.executeQuery().toList { toMottakIdInfo() }
        }
    }

fun ResultSet.toMottakIdInfo(): MottakIdInfo =
    MottakIdInfo(
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("EBCOMNAVN"),
        getString("CPA_ID"),
        getString("STATUS"),
        meldingsparam = getString("MELDINGSPARAM"),
        refparam = getString("REFERANSEPARAM"),
        avsenderparam = getString("AVSENDERPARAM"),
        ebconvers_id = getString("EBCONVERS_ID"),
        ebmessage_id = getString("EBMESAGE_ID"),
        certdn = getString("CERTDN"),
        trustdn = getString("TRUSTDN"),
        docsignerdn = getString("DOCSIGNERDN"),
        docsignerissuerdn = getString("DOCSIGNERISSUERDN"),
    )
