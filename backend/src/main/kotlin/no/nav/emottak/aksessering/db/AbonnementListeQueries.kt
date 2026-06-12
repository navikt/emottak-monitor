package no.nav.emottak.aksessering.db

import io.ktor.http.decodeURLQueryComponent
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.AbonnementListeData
import no.nav.emottak.model.Pageable
import no.nav.emottak.util.hentHelsePersonellData
import java.sql.Connection
import java.sql.ResultSet
import kotlin.text.contains
import kotlin.use

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
    } catch (e: Exception) {
        try {
            val blob = getBlob(columnLabel)
            if (!wasNull() && blob != null) {
                String(blob.getBytes(1, blob.length().toInt()), Charsets.UTF_8)
            } else {
                getString(columnLabel)
            }
        } catch (e2: Exception) {
            getString(columnLabel)
        }
    }

fun DatabaseInterface.hentAbonnementListe(
    databasePrefix: String,
    columnSearchEncoded: String? = "",
): AbonnementListeData =
    connection.use { connection ->
        val columnSearch = columnSearchEncoded?.decodeURLQueryComponent()
        log.debug("columnSearch: '$columnSearch'")
        val sequence = columnSearch?.splitToSequence("¤")
        log.debug("Sequence: {}", sequence?.toList())

        val isSearchEmpty: Boolean = sequence?.first().equals("")
        val isSearchColnEmpty: Boolean = sequence?.last().equals("") || sequence?.last().equals("TOMT")
        val isEqual: Boolean = columnSearch!!.contains("er lik")
        val isStart: Boolean = columnSearch!!.contains("starter med")
        val isContain: Boolean = columnSearch!!.contains("inneholder")
        var sok: String? = ""

        if (!isSearchEmpty) {
            if (isStart) {
                sok = sequence?.first() + "%"
            } else if (isContain) {
                sok = "%" + sequence?.first() + "%"
            } else if (isEqual) {
                sok = sequence?.first()
            }
        }

        if (sequence!!.first().contains("999999")) {
            sok = "999999"
        }
        log.info("Sok: '$sok'")

        // Totalt antall CPA'er eller partnere:
        var sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.ABONNEMENT"
        log.debug("SQL FOR ANTALL TOTALT: '{}'", sqlTotaltAntall)
        val totalCount = connection.executeCountQuery(sqlTotaltAntall, null)

        val sqlColmSearchResultQuery =
            generateSQLQuery(
                databasePrefix,
                sequence,
                isSearchEmpty,
                isSearchColnEmpty,
                isEqual,
                isContain,
                isStart,
            )
        log.debug("SQL FOR DETALJER: '{}'", sqlColmSearchResultQuery)
        val listColmSearch = connection.exeuteAbonnementListeQuery(sqlColmSearchResultQuery, sok)

        AbonnementListeData(
            listColmSearch,
            totalCount,
        )
    }

private fun generateSQLQuery(
    databasePrefix: String,
    sequence: Sequence<String>,
    isSearchEmpty: Boolean,
    isSearchColnEmpty: Boolean,
    isEqual: Boolean,
    isContain: Boolean,
    isStart: Boolean,
    pageable: Pageable? = null,
    generatePartnerQuery: Boolean = false,
): String {
    var sqlColmSearch =
        "SELECT PARTNER.NAVN AS partner_navn, PARTNER.PARTNER_ID AS partner_id, PARTNER.HER_ID, PARTNER.ORGNUMMER AS partner_orgnr, " +
            "ABONNEMENT.KEY, ABONNEMENT.SLUTT_DATO, ABONNEMENT.SIST_ENDRET AS endret_dato, ABONNEMENT.DATA, ABONNEMENT.MOTTAK_ID, ABONNEMENT.AB_ID "

    sqlColmSearch +=
        if (generatePartnerQuery) {
            """
               FROM $databasePrefix.ABONNEMENT
               LEFT JOIN $databasePrefix.PARTNER ON PARTNER.PARTNER_ID = ABONNEMENT.PARTNER_ID 
            """
        } else {
            // Spørring for CPA-Liste:
            """
               FROM $databasePrefix.PARTNER, $databasePrefix.ABONNEMENT 
               WHERE PARTNER.PARTNER_ID = ABONNEMENT.PARTNER_ID AND ABONNEMENT.TJENESTE_ID = 3
            """
        }

    // Search Not Empty
    if (!isSearchEmpty) {
        // Colmn Empty
        if (isSearchColnEmpty) {
            if (isEqual) {
                sqlColmSearch += " AND LOWER(?) IN (" +
                    "LOWER(PARTNER.PARTNER_ID), " +
                    "LOWER(ABONNEMENT.KEY), " +
                    "PARTNER.ORGNUMMER, " +
                    "PARTNER.HER_ID )) "
            } else if (isContain || isStart) {
                if (sequence?.last().equals("") || sequence?.last().equals("TOMT")) {
                    sqlColmSearch += " AND LOWER(PARTNER.PARTNER_ID)  LIKE LOWER(?) "
                }
                if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER.PARTNER_ID)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("KEY")) {
                    sqlColmSearch += " AND ABONNEMENT.KEY LIKE ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  LIKE ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  LIKE ? "
                }
            }
        } else {
            // Colmn NOT Empty
            if (isContain || isStart) {
                if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER.PARTNER_ID)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("KEY")) {
                    sqlColmSearch += " AND ABONNEMENT.KEY LIKE ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  LIKE ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  LIKE ? "
                }
            } else if (isEqual) {
                if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER.PARTNER_ID)  = LOWER(?) "
                } else if (sequence?.last().equals("KEY")) {
                    sqlColmSearch += " AND ABONNEMENT.KEY = ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  = ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  = ? "
                }
            }
        }
        sqlColmSearch += " ORDER BY PARTNER.PARTNER_ID DESC "
    } else {
        sqlColmSearch += " ORDER BY PARTNER.PARTNER_ID ASC "
    }
    if (pageable != null) {
        sqlColmSearch += " OFFSET " + pageable.offset + " ROWS FETCH NEXT " + pageable.pageSize + " ROWS ONLY "
    }
    return sqlColmSearch
}

private fun Connection.executeCountQuery(
    sqlQuery: String,
    sok: String?,
): Long {
    val preparedStatement = this.prepareStatement(sqlQuery)
    if (!sok.isNullOrBlank()) {
        log.debug("Legger inn søk: '$sok'")
        preparedStatement.setObject(1, sok)
    }
    return preparedStatement.use {
        val rs = it.executeQuery()
        rs.next()
        rs.getLong(1)
    }
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
    log.info("DATA-felt fra DB: lengde=${data?.length}, erNull=${data == null}, start='${data?.take(80)}'")
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
