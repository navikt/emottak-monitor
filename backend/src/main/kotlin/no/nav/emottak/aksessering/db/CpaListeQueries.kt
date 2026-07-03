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
                sqlColumnSearch += if (generatePartnerQuery) " WHERE" else " AND"
                sqlColumnSearch += """ LOWER(?) IN (
                    LOWER(PARTNER_CPA.CPA_ID), 
                    PARTNER.ORGNUMMER, 
                    PARTNER.HER_ID, 
                    LOWER(PARTNER.NAVN), 
                    LOWER(PARTNER_CPA.PARTNER_ENDPOINT), 
                    LOWER(PARTNER_CPA.PARTNER_SUBJECTDN), 
                    LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE)"""
                sqlColumnSearch +=
                    if (columnSearch.sok.isNumeric()) {
                        ", PARTNER.PARTNER_ID )"
                    } else {
                        " )"
                    }
            } else if (columnSearch.isContain || columnSearch.isStart) {
                sqlColumnSearch += if (generatePartnerQuery) " WHERE" else " AND"
                sqlColumnSearch += """ (
                    LOWER(PARTNER_CPA.CPA_ID) LIKE LOWER(?) 
                    OR PARTNER.PARTNER_ID LIKE ? 
                    OR PARTNER.ORGNUMMER LIKE ? 
                    OR PARTNER.HER_ID LIKE ? 
                    OR LOWER(PARTNER.NAVN) LIKE LOWER(?) 
                    OR LOWER(PARTNER_CPA.PARTNER_ENDPOINT) LIKE LOWER(?) 
                    OR LOWER(PARTNER_CPA.PARTNER_SUBJECTDN) LIKE LOWER(?) 
                    OR LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE) LIKE LOWER(?) 
                ) """
            }
        } else {
            // Column NOT Empty
            if (columnSearch.isContain || columnSearch.isStart) {
                sqlColumnSearch += likeSearch(columnSearch, generatePartnerQuery)
            } else if (columnSearch.isEqual) {
                sqlColumnSearch += equalSearch(columnSearch, generatePartnerQuery)
            }
        }
        sqlColumnSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
    } else {
        sqlColumnSearch += " ORDER BY PARTNER_CPA.CPA_ID DESC "
    }
    return sqlColumnSearch
}

private fun likeSearch(
    columnSearch: ColumnSearch,
    isPartnerQuery: Boolean,
): String {
    val keyword = if (isPartnerQuery) " WHERE" else " AND"
    if (columnSearch.sequence?.last().equals("CPA_ID")) {
        return "$keyword LOWER(PARTNER_CPA.CPA_ID) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        return if (columnSearch.sok.isNumeric()) {
            "$keyword PARTNER.PARTNER_ID LIKE ? "
        } else {
            "$keyword PARTNER.PARTNER_ID LIKE 999999 "
        }
    } else if (columnSearch.sequence?.last().equals("PARTNER_NAME")) {
        return "$keyword LOWER(PARTNER.NAVN) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        return "$keyword PARTNER.ORGNUMMER LIKE ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        return "$keyword PARTNER.HER_ID LIKE ? "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ENDPOINT")) {
        return "$keyword LOWER(PARTNER_CPA.PARTNER_ENDPOINT) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_SUBJECTDN")) {
        return "$keyword LOWER(PARTNER_CPA.PARTNER_SUBJECTDN) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KomSystem")) {
        return "$keyword LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE) LIKE LOWER(?) "
    } else {
        log.warn("Ukjent kolonne for likeSearch: '{}'", columnSearch.sequence?.last())
        return ""
    }
}

private fun equalSearch(
    columnSearch: ColumnSearch,
    isPartnerQuery: Boolean,
): String {
    val keyword = if (isPartnerQuery) " WHERE" else " AND"
    if (columnSearch.sequence?.last().equals("CPA_ID")) {
        return "$keyword LOWER(PARTNER_CPA.CPA_ID) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        return if (columnSearch.sok.isNumeric()) {
            "$keyword PARTNER.PARTNER_ID = ? "
        } else {
            "$keyword PARTNER.PARTNER_ID = 999999 "
        }
    } else if (columnSearch.sequence?.last().equals("PARTNER_NAME")) {
        return "$keyword LOWER(PARTNER.NAVN) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        return "$keyword PARTNER.ORGNUMMER = ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        return "$keyword PARTNER.HER_ID = ? "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ENDPOINT")) {
        return "$keyword LOWER(PARTNER_CPA.PARTNER_ENDPOINT) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_SUBJECTDN")) {
        return "$keyword LOWER(PARTNER_CPA.PARTNER_SUBJECTDN) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KomSystem")) {
        return "$keyword LOWER(KOMMUNIKASJONSSYSTEM.BESKRIVELSE) = LOWER(?) "
    } else {
        log.warn("Ukjent kolonne for equalSearch: '{}'", columnSearch.sequence?.last())
        return ""
    }
}

private fun Connection.exeutePartnerCpaListeQuery(
    query: String,
    sok: String?,
): List<PartnerCpaListe> {
    try {
        val preparedStatement = this.prepareStatement(query)
        if (!sok.isNullOrBlank()) {
            preparedStatement.setObjects(query, sok)
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

private fun String?.isNumeric() = this?.trim('%')?.matches(Regex("^[0-9]+$")) ?: false
