package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.util.hentHelsePersonellData
import org.slf4j.Logger
import java.sql.Connection
import java.sql.ResultSet
import kotlin.use

fun DatabaseInterface.hentAbonnementListe(databasePrefix: String): AbonnementListeData =
    connection.use { connection ->
        val sqlQuery = """
            SELECT PARTNER.NAVN AS partner_navn, PARTNER.PARTNER_ID AS partner_id, PARTNER.HER_ID, PARTNER.ORGNUMMER AS partner_orgnr, 
            ABONNEMENT."KEY", ABONNEMENT.SLUTT_DATO, ABONNEMENT.SIST_ENDRET AS endret_dato, ABONNEMENT."DATA", ABONNEMENT.MOTTAK_ID, ABONNEMENT.AB_ID 
            FROM $databasePrefix.PARTNER, $databasePrefix.ABONNEMENT 
            WHERE PARTNER.PARTNER_ID = ABONNEMENT.PARTNER_ID AND ABONNEMENT.TJENESTE_ID = 3
            ORDER BY PARTNER.PARTNER_ID ASC
        """
        log.debug("SQL FOR ABONNENTER: '{}'", sqlQuery)
        val listColmSearch = connection.exeuteAbonnementListeQuery(sqlQuery)
        AbonnementListeData(listColmSearch, listColmSearch.size.toLong())
    }

private fun Connection.exeuteAbonnementListeQuery(query: String): List<Abonnement> {
    try {
        val preparedStatement = this.prepareStatement(query)
        return preparedStatement.use { it.executeQuery().toList { toAbonnementListe() } }.toList().also { checkForDuplicates(it) }
    } catch (e: Exception) {
        this.rollback()
        log.error("Error: ($e)")
        throw e
    } finally {
        this.close()
    }
}

private fun ResultSet.toAbonnementListe(): Abonnement {
    val data = getColumnAsString("DATA")
    log.debug("DATA-felt fra DB: lengde=${data?.length}, erNull=${data == null}, start='${data?.take(180)}'")
    val helsepersonellData = hentHelsePersonellData(data ?: "")
    return Abonnement(
        endretDato = getString("endret_dato"),
        sluttDato = getString("slutt_dato"),
        tssId = getString("key"),
        behandlerInfo = helsepersonellData,
        partnerNavn = getString("partner_navn"),
        partnerId = getString("partner_id"),
        partnerOrgnr = getString("partner_orgnr"),
        partnerHerId = getString("HER_ID"),
        abId = getLong("ab_id"),
    )
}

/**
 * Leser en kolonne som String, med støtte for Oracle BLOB og CLOB.
 * getString() returnerer null for BLOB-kolonner i Oracle JDBC.
 */
private fun ResultSet.getColumnAsString(columnLabel: String): String? =
    try {
        val clob = getClob(columnLabel)
        if (!wasNull() && clob != null) {
            clob.characterStream.use { it.readText() }
        } else {
            getString(columnLabel)
        }
    } catch (_: Exception) {
        try {
            val blob = getBlob(columnLabel)
            if (!wasNull() && blob != null) {
                String(blob.getBytes(1, blob.length().toInt()), Charsets.UTF_8)
            } else {
                getString(columnLabel)
            }
        } catch (_: Exception) {
            getString(columnLabel)
        }
    }

internal fun checkForDuplicates(
    abonnementer: List<Abonnement>,
    logger: Logger = log,
) {
    val alleBehandlere = abonnementer.filter { it.behandlerInfo != null }.map { it.behandlerInfo!! }
    val duplikater =
        alleBehandlere
            .groupBy {
                "${it.fornavn?.trim()?.lowercase()}|${it.etternavn?.trim()?.lowercase()}|${it.hpr?.trim()}|${it.herId?.trim()}"
            }.filter { (_, forekomster) -> forekomster.size > 1 }
    if (duplikater.isNotEmpty()) {
        duplikater.forEach { (_, forekomster) ->
            val b = forekomster.first()
            logger.warn(
                "Duplikat helsepersonell funnet (${forekomster.size} ganger): " +
                    "GivenName='${b.fornavn}', FamilyName='${b.etternavn}', HPR='${b.hpr}', HerId='${b.herId}'",
            )
        }
    } else {
        logger.info("Ingen duplikate helsepersonell funnet (totalt ${alleBehandlere.size} behandlere).")
    }
}
