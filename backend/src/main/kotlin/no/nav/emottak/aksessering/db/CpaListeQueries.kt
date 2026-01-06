package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.log
import no.nav.emottak.model.CpaListe
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import java.sql.PreparedStatement
import java.sql.ResultSet
import kotlin.collections.toList
import kotlin.plus
import kotlin.sequences.first
import kotlin.sequences.last
import kotlin.text.contains
import kotlin.text.equals
import kotlin.text.splitToSequence
import kotlin.use

fun DatabaseInterface.hentCpaliste(
    databasePrefix: String,
    columnSearch: String? = "",
    pageable: Pageable? = null,
): Page<CpaListe> =
    connection.use { connection ->

        var sequence = columnSearch?.splitToSequence(";")
        var isSearchEmpty: Boolean = sequence?.first().equals("")
        var isSearchColnEmpty: Boolean = sequence?.last().equals("") || sequence?.last().equals("TOMT")
        var sqlColmSearch: String? = ""
        val isEqual: Boolean = columnSearch!!.contains("er lik")
        val isStart: Boolean = columnSearch!!.contains("starter med")
        val isContain: Boolean = columnSearch!!.contains("inneholder")
        var sok: String? = ""
        var statColmSearch: PreparedStatement? = null
        var listColmSearch: List<CpaListe>? = null

        if (isStart) {
            sok = sequence?.first() + "%"
        } else if (isContain) {
            sok = "%" + sequence?.first() + "%"
        } else if (isEqual) {
            sok = sequence?.first()
        }

        if (sequence!!.first().contains("999999")) {
            sok = "999999"
        }
        /** Liste over cpaer */
        val countStatement =
            connection.prepareStatement(
                """
                SELECT count(*)
                    FROM $databasePrefix.PARTNER_CPA
            """,
            )

        val totalCount =
            countStatement.use {
                val rs = it.executeQuery()
                rs.next()
                rs.getLong(1)
            }
        sqlColmSearch = """
                    SELECT PARTNER_CPA.PARTNER_SUBJECTDN, PARTNER.PARTNER_ID, PARTNER.HER_ID, PARTNER.ORGNUMMER, PARTNER_CPA.CPA_ID, PARTNER_CPA.NAV_CPP_ID, PARTNER_CPA.PARTNER_CPP_ID,  
                    PARTNER_CPA.PARTNER_ENDPOINT, KOMMUNIKASJONSSYSTEM.BESKRIVELSE, PARTNER_CPA.LASTUSED
                   FROM $databasePrefix.PARTNER_CPA, $databasePrefix.PARTNER, $databasePrefix.KOMMUNIKASJONSSYSTEM 
                   WHERE PARTNER_CPA.PARTNER_ID = PARTNER.PARTNER_ID AND PARTNER.KOMMUNIKASJONSSYSTEM_ID = KOMMUNIKASJONSSYSTEM.KOMMUNIKASJONSSYSTEM_ID
                   """
        // Search Not Empty
        // log.info("\nWholeSearch [${columnSearch}] \nsequence [${sequence}]\nisSearchEmpty: ${isSearchEmpty} \nisSearchColnEmpty: ${isSearchColnEmpty} \nSøkefelt: ${sequence!!.first()} \nColmn: ${sequence.last()} \nisContain: ${isContain} \nisStart: ${isStart} \nlike: ${isEqual} \nsok: ${sok} \nsqlColmSearch: ${sqlColmSearch}")
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
            sqlColmSearch += " ORDER BY PARTNER.PARTNER_ID DESC "
            try {
                statColmSearch = connection.prepareStatement(sqlColmSearch)

                statColmSearch.setObject(1, sok)

                listColmSearch = statColmSearch.use { it.executeQuery().toList { toCpaliste() } }.toList()
            } catch (e: Exception) {
                connection.rollback()
                log.info("Error: ($e)")
                throw e
            } finally {
                connection?.close()
            }
        } else {
            sqlColmSearch += " ORDER BY PARTNER.PARTNER_ID DESC "
            // We only use LIMIT and OFFSET when asked for a page
            if (pageable != null) {
                sqlColmSearch += " OFFSET " + pageable.offset + " ROWS FETCH NEXT " + pageable.pageSize + " ROWS ONLY "
            }
            log.info("sql: $sqlColmSearch")
            statColmSearch = connection.prepareStatement(sqlColmSearch)

            listColmSearch =
                statColmSearch
                    .use {
                        it.executeQuery().toList { toCpaliste() }
                    }.toList()
        }
        var returnPageable = pageable
        if (returnPageable == null) {
            returnPageable = Pageable(1, listColmSearch.size)
        }

        Page(returnPageable.pageNumber, returnPageable.pageSize, null, totalCount, listColmSearch)
    }

fun ResultSet.toCpaliste(): CpaListe =
    CpaListe(
        getString("PARTNER_SUBJECTDN"),
        getString("PARTNER_ID"),
        getString("HER_ID"),
        getString("ORGNUMMER"),
        getString("CPA_ID"),
        getString("NAV_CPP_ID"),
        getString("PARTNER_CPP_ID"),
        getString("PARTNER_ENDPOINT"),
        getString("BESKRIVELSE"),
        getString("LASTUSED"),
    )
