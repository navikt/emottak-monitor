package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.util.hentHelsePersonellData
import java.sql.Connection
import java.sql.ResultSet
import kotlin.use

fun DatabaseInterface.hentAbonnementListe(
    databasePrefix: String,
    columnSearchEncoded: String? = "",
): AbonnementListeData =
    connection.use { connection ->
        val columnSearch = getColumnSearch(columnSearchEncoded)

        // Totalt antall abonnement:
        val sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.ABONNEMENT"
        log.debug("SQL FOR ANTALL TOTALT: '{}'", sqlTotaltAntall)
        val totalCount = connection.executeCountQuery(sqlTotaltAntall, null)

        val sqlColmSearchResultQuery = generateSQLQuery(databasePrefix, columnSearch)
        log.debug("SQL FOR DETALJER: '{}'", sqlColmSearchResultQuery)
        val listColmSearch = connection.exeuteAbonnementListeQuery(sqlColmSearchResultQuery, columnSearch.sok)

        AbonnementListeData(
            listColmSearch,
            totalCount,
        )
    }

private fun generateSQLQuery(
    databasePrefix: String,
    columnSearch: ColumnSearch,
): String {
    var sqlColumnSearch = """
            SELECT PARTNER.NAVN AS partner_navn, PARTNER.PARTNER_ID AS partner_id, PARTNER.HER_ID, PARTNER.ORGNUMMER AS partner_orgnr, 
            ABONNEMENT.KEY, ABONNEMENT.SLUTT_DATO, ABONNEMENT.SIST_ENDRET AS endret_dato, ABONNEMENT.DATA, ABONNEMENT.MOTTAK_ID, ABONNEMENT.AB_ID 
            FROM $databasePrefix.PARTNER, $databasePrefix.ABONNEMENT 
            WHERE PARTNER.PARTNER_ID = ABONNEMENT.PARTNER_ID AND ABONNEMENT.TJENESTE_ID = 3
        """

    // Search Not Empty
    if (!columnSearch.isSearchTextEmpty) {
        // Column Empty
        if (columnSearch.isSearchColnEmpty) {
            if (columnSearch.isEqual) {
                sqlColumnSearch += " AND LOWER(?) IN (" +
                    "LOWER(PARTNER.PARTNER_ID), " +
                    "LOWER(ABONNEMENT.KEY), " +
                    "PARTNER.ORGNUMMER, " +
                    "PARTNER.HER_ID )) "
            } else if (columnSearch.isContain || columnSearch.isStart) {
                if (columnSearch.sequence?.last().equals("") || columnSearch.sequence?.last().equals("TOMT")) {
                    sqlColumnSearch += " AND LOWER(PARTNER.PARTNER_ID) LIKE LOWER(?) "
                }
                sqlColumnSearch += likeSearch(columnSearch)
            }
        } else {
            // Column NOT Empty
            if (columnSearch.isContain || columnSearch.isStart) {
                sqlColumnSearch += likeSearch(columnSearch)
            } else if (columnSearch.isEqual) {
                sqlColumnSearch += equalSearch(columnSearch)
            }
        }
        sqlColumnSearch += " ORDER BY PARTNER.PARTNER_ID DESC "
    } else {
        sqlColumnSearch += " ORDER BY PARTNER.PARTNER_ID ASC "
    }
    return sqlColumnSearch
}

private fun likeSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND LOWER(PARTNER.PARTNER_ID) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KEY")) {
        " AND ABONNEMENT.KEY LIKE ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER LIKE ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID LIKE ? "
    } else {
        ""
    }

private fun equalSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND LOWER(PARTNER.PARTNER_ID) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KEY")) {
        " AND ABONNEMENT.KEY = ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER = ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID = ? "
    } else {
        ""
    }

private fun Connection.exeuteAbonnementListeQuery(
    query: String,
    sok: String?,
): List<Abonnement> {
    try {
        val preparedStatement = this.prepareStatement(query)
        if (!sok.isNullOrBlank()) {
            preparedStatement.setObject(1, sok)
        }
        return preparedStatement.use { it.executeQuery().toList { toAbonnementListe() } }.toList().also { abonnementer ->
            val alleBehandlere = abonnementer.flatMap { it.BehandlerInfo }
            val duplikater =
                alleBehandlere
                    .groupBy {
                        "${it.B_FNavn?.trim()?.lowercase()}|${it.B_FamilieNavn?.trim()?.lowercase()}|${it.B_Hpr?.trim()}|${it.B_Herid?.trim()}"
                    }.filter { (_, forekomster) -> forekomster.size > 1 }
            if (duplikater.isNotEmpty()) {
                duplikater.forEach { (_, forekomster) ->
                    val b = forekomster.first()
                    log.warn(
                        "Duplikat helsepersonell funnet (${forekomster.size} ganger): " +
                            "GivenName='${b.B_FNavn}', FamilyName='${b.B_FamilieNavn}', HPR='${b.B_Hpr}', HerId='${b.B_Herid}'",
                    )
                }
            } else {
                log.info("Ingen duplikate helsepersonell funnet (totalt ${alleBehandlere.size} behandlere).")
            }
        }
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
    log.debug("DATA-felt fra DB: lengde=${data?.length}, erNull=${data == null}, start='${data?.take(80)}'")
    return Abonnement(
        endret_dato = getString("endret_dato"),
        slutt_dato = getString("slutt_dato"),
        tssid = getString("key"),
        data = data,
        BehandlerInfo = hentHelsePersonellData(data ?: ""),
        partner_navn = getString("partner_navn"),
        partner_id = getString("partner_id"),
        partner_orgnr = getString("partner_orgnr"),
        partner_herid = getString("HER_ID"),
        ab_id = getLong("ab_id"),
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
