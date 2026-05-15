package no.nav.emottak.aksessering.db

import io.ktor.http.decodeURLQueryComponent
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.PartnerCpaListe
import no.nav.emottak.model.PartnerCpaListeData
import java.sql.Connection
import java.sql.ResultSet
import kotlin.use

fun DatabaseInterface.hentPartnerCpaListe(
    databasePrefix: String,
    columnSearchEncoded: String? = "",
    isPartner: Boolean = false,
): PartnerCpaListeData =
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
        var sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.PARTNER_CPA"
        if (isPartner) sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.PARTNER"
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
                generatePartnerQuery = isPartner,
            )
        log.debug("SQL FOR DETALJER: '{}'", sqlColmSearchResultQuery)
        val listColmSearch = connection.exeutePartnerCpaListeQuery(sqlColmSearchResultQuery, sok)

        PartnerCpaListeData(
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
        "SELECT PARTNER.NAVN, PARTNER_CPA.PARTNER_SUBJECTDN, PARTNER.PARTNER_ID, PARTNER.HER_ID, PARTNER.ORGNUMMER, PARTNER_CPA.CPA_ID, " +
            "PARTNER_CPA.NAV_CPP_ID, PARTNER_CPA.PARTNER_CPP_ID, PARTNER_CPA.PARTNER_ENDPOINT, KOMMUNIKASJONSSYSTEM.BESKRIVELSE, PARTNER_CPA.LASTUSED "

    sqlColmSearch +=
        if (generatePartnerQuery) {
            // Spørring med LEFT JOIN for PartnerListe, slik at vi får med partnere uten CPA'er også:
            """
               FROM $databasePrefix.PARTNER
               LEFT JOIN $databasePrefix.PARTNER_CPA ON PARTNER.PARTNER_ID = PARTNER_CPA.PARTNER_ID 
               LEFT JOIN $databasePrefix.KOMMUNIKASJONSSYSTEM ON PARTNER.KOMMUNIKASJONSSYSTEM_ID = KOMMUNIKASJONSSYSTEM.KOMMUNIKASJONSSYSTEM_ID 
            """
        } else {
            // Spørring for CPA-Liste:
            """
               FROM $databasePrefix.PARTNER_CPA, $databasePrefix.PARTNER, $databasePrefix.KOMMUNIKASJONSSYSTEM 
               WHERE PARTNER_CPA.PARTNER_ID = PARTNER.PARTNER_ID AND PARTNER.KOMMUNIKASJONSSYSTEM_ID = KOMMUNIKASJONSSYSTEM.KOMMUNIKASJONSSYSTEM_ID
            """
        }

    // Search Not Empty
    if (!isSearchEmpty) {
        // Colmn Empty
        if (isSearchColnEmpty) {
            if (isEqual) {
                sqlColmSearch += " AND LOWER(?) IN (" +
                    "LOWER(PARTNER_CPA.CPA_ID), " +
                    "LOWER(PARTNER_CPA.PARTNER_ENDPOINT), " +
                    "LOWER(PARTNER_CPA.PARTNER_SUBJECTDN), " +
                    "PARTNER.ORGNUMMER, " +
                    "PARTNER.HER_ID, " +
                    "LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)) "
            } else if (isContain || isStart) {
                if (sequence?.last().equals("") || sequence?.last().equals("TOMT")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.CPA_ID)  LIKE LOWER(?) "
                }
                if (sequence?.last().equals("CPA_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.CPA_ID)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND PARTNER.PARTNER_ID LIKE ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  LIKE ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  LIKE ? "
                } else if (sequence?.last().equals("PARTNER_ENDPOINT")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_ENDPOINT)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_SUBJECTDN")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_SUBJECTDN)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("KomSystem")) {
                    sqlColmSearch += " AND LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)  LIKE LOWER(?) "
                }
            }
        } else {
            // Colmn NOT Empty
            if (isContain || isStart) {
                if (sequence?.last().equals("CPA_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.CPA_ID)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND PARTNER.PARTNER_ID LIKE ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  LIKE ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  LIKE ? "
                } else if (sequence?.last().equals("PARTNER_ENDPOINT")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_ENDPOINT)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_SUBJECTDN")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_SUBJECTDN)  LIKE LOWER(?) "
                } else if (sequence?.last().equals("KomSystem")) {
                    sqlColmSearch += " AND LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)  LIKE LOWER(?) "
                }
            } else if (isEqual) {
                if (sequence?.last().equals("CPA_ID")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.CPA_ID)  = LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_ID")) {
                    sqlColmSearch += " AND PARTNER.PARTNER_ID = ? "
                } else if (sequence?.last().equals("OrgNr")) {
                    sqlColmSearch += " AND PARTNER.ORGNUMMER  = ? "
                } else if (sequence?.last().equals("HerId")) {
                    sqlColmSearch += " AND PARTNER.HER_ID  = ? "
                } else if (sequence?.last().equals("PARTNER_ENDPOINT")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_ENDPOINT)  = LOWER(?) "
                } else if (sequence?.last().equals("PARTNER_SUBJECTDN")) {
                    sqlColmSearch += " AND LOWER(PARTNER_CPA.PARTNER_SUBJECTDN)  = LOWER(?) "
                } else if (sequence?.last().equals("KomSystem")) {
                    sqlColmSearch += " AND LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)  = LOWER(?) "
                }
            }
        }
        sqlColmSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
    } else {
        sqlColmSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
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

private fun Connection.exeutePartnerCpaListeQuery(
    query: String,
    sok: String?,
): List<PartnerCpaListe> {
    try {
        val preparedStatement = this.prepareStatement(query)
        if (!sok.isNullOrBlank()) {
            preparedStatement.setObject(1, sok)
        }
        return preparedStatement.use { it.executeQuery().toList { toPartnerCpaListe() } }.toList()
    } catch (e: Exception) {
        this.rollback()
        log.error("Error: ($e)")
        throw e
    } finally {
        this.close()
    }
}

private fun ResultSet.toPartnerCpaListe(): PartnerCpaListe =
    PartnerCpaListe(
        partnerName = getString("Navn"),
        partnerSubjectDN = getString("PARTNER_SUBJECTDN"),
        partnerID = getString("PARTNER_ID"),
        herID = getString("HER_ID"),
        orgNummer = getString("ORGNUMMER"),
        cpaID = getString("CPA_ID"),
        navCppID = getString("NAV_CPP_ID"),
        partnerCppID = getString("PARTNER_CPP_ID"),
        partnerEndpoint = getString("PARTNER_ENDPOINT"),
        komSystem = getString("BESKRIVELSE"),
        lastUsed = getString("LASTUSED"),
        lastUsedEbms = null,
    )
