package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.PartnerCpaListe
import no.nav.emottak.model.PartnerCpaListeData
import java.sql.Connection
import java.sql.ResultSet
import kotlin.use

fun DatabaseInterface.hentPartnerCpaListe(
    databasePrefix: String,
    columnSearchEncoded: String = "",
    isPartner: Boolean = false,
): PartnerCpaListeData =
    connection.use { connection ->
        val columnSearch = getColumnSearch(columnSearchEncoded)

        // Totalt antall CPA'er eller partnere:
        var sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.PARTNER_CPA"
        if (isPartner) sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.PARTNER"
        log.debug("SQL FOR ANTALL TOTALT: '{}'", sqlTotaltAntall)
        val totalCount = connection.executeCountQuery(sqlTotaltAntall, null)

        val sqlColmSearchResultQuery =
            generateSQLQuery(
                databasePrefix,
                columnSearch,
                generatePartnerQuery = isPartner,
            )
        log.debug("SQL FOR DETALJER: '{}'", sqlColmSearchResultQuery)
        val listColmSearch = connection.exeutePartnerCpaListeQuery(sqlColmSearchResultQuery, columnSearch.sok)

        PartnerCpaListeData(
            listColmSearch,
            totalCount,
        )
    }

private fun generateSQLQuery(
    databasePrefix: String,
    columnSearch: ColumnSearch,
    generatePartnerQuery: Boolean = false,
): String {
    var sqlColumnSearch =
        "SELECT PARTNER.NAVN, PARTNER_CPA.PARTNER_SUBJECTDN, PARTNER.PARTNER_ID, PARTNER.HER_ID, PARTNER.ORGNUMMER, PARTNER_CPA.CPA_ID, " +
            "PARTNER_CPA.NAV_CPP_ID, PARTNER_CPA.PARTNER_CPP_ID, PARTNER_CPA.PARTNER_ENDPOINT, KOMMUNIKASJONSSYSTEM.BESKRIVELSE, PARTNER_CPA.LASTUSED "

    sqlColumnSearch +=
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
    if (!columnSearch.isSearchTextEmpty) {
        // Column Empty
        if (columnSearch.isSearchColnEmpty) {
            if (columnSearch.isEqual) {
                sqlColumnSearch += " AND LOWER(?) IN (" +
                    "LOWER(PARTNER_CPA.CPA_ID), " +
                    "LOWER(PARTNER_CPA.PARTNER_ENDPOINT), " +
                    "LOWER(PARTNER_CPA.PARTNER_SUBJECTDN), " +
                    "PARTNER.ORGNUMMER, " +
                    "PARTNER.HER_ID, " +
                    "LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)) "
            } else if (columnSearch.isContain || columnSearch.isStart) {
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
        sqlColumnSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
    } else {
        sqlColumnSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
    }
    return sqlColumnSearch
}

private fun likeSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("CPA_ID")) {
        " AND LOWER(PARTNER_CPA.CPA_ID) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND PARTNER.PARTNER_ID LIKE ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER LIKE ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID LIKE ? "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ENDPOINT")) {
        " AND LOWER(PARTNER_CPA.PARTNER_ENDPOINT) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_SUBJECTDN")) {
        " AND LOWER(PARTNER_CPA.PARTNER_SUBJECTDN) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KomSystem")) {
        " AND LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE) LIKE LOWER(?) "
    } else {
        ""
    }

private fun equalSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("CPA_ID")) {
        " AND LOWER(PARTNER_CPA.CPA_ID) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND PARTNER.PARTNER_ID = ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER = ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID = ? "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ENDPOINT")) {
        " AND LOWER(PARTNER_CPA.PARTNER_ENDPOINT) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_SUBJECTDN")) {
        " AND LOWER(PARTNER_CPA.PARTNER_SUBJECTDN) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KomSystem")) {
        " AND LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE) = LOWER(?) "
    } else {
        ""
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
