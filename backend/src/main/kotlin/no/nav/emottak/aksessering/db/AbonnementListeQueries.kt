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
import kotlin.collections.component1
import kotlin.collections.component2
import kotlin.collections.contains
import kotlin.use

val AFTER_SQL_FILTERS = listOf("BEHANDLER_NAVN", "BEHANDLER_HERID", "BEHANDLER_HPR")

fun DatabaseInterface.hentAbonnementListe(
    databasePrefix: String,
    columnSearchEncoded: String = "",
): AbonnementListeData =
    connection.use { connection ->
        val columnSearch = getColumnSearch(columnSearchEncoded)

        // Totalt antall abonnement:
        val sqlTotaltAntall = "SELECT count(*) FROM $databasePrefix.ABONNEMENT"
        log.debug("SQL FOR ANTALL TOTALT: '{}'", sqlTotaltAntall)
        val totalCount = connection.executeCountQuery(sqlTotaltAntall, null)

        val sqlColmSearchResultQuery = generateSQLQuery(databasePrefix, columnSearch)
        log.debug("SQL FOR DETALJER: '{}'", sqlColmSearchResultQuery)
        val listColmSearch = connection.exeuteAbonnementListeQuery(sqlColmSearchResultQuery, columnSearch)

        AbonnementListeData(
            listColmSearch.afterSQLFiltering(columnSearch),
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
                    "PARTNER.HER_ID ) "
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
        sqlColumnSearch += " ORDER BY PARTNER.PARTNER_ID ASC "
    } else {
        sqlColumnSearch += " ORDER BY PARTNER.PARTNER_ID ASC "
    }
    return sqlColumnSearch
}

private fun likeSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("PARTNER_NAVN")) {
        " AND PARTNER.NAVN LIKE ? "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND LOWER(PARTNER.PARTNER_ID) LIKE LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KEY")) {
        " AND ABONNEMENT.KEY LIKE ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER LIKE ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID LIKE ? "
    } else if (columnSearch.applyFilterAfterSQL()) {
        log.debug("Innsendt filter '{}' kjøres ETTER at SQL har hentet data", columnSearch.sequence?.last())
        ""
    } else {
        log.warn("Ukjent kolonne for likeSearch: '{}'", columnSearch.sequence?.last())
        ""
    }

private fun equalSearch(columnSearch: ColumnSearch) =
    if (columnSearch.sequence?.last().equals("PARTNER_NAVN")) {
        " AND LOWER(PARTNER.NAVN) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("PARTNER_ID")) {
        " AND LOWER(PARTNER.PARTNER_ID) = LOWER(?) "
    } else if (columnSearch.sequence?.last().equals("KEY")) {
        " AND ABONNEMENT.KEY = ? "
    } else if (columnSearch.sequence?.last().equals("OrgNr")) {
        " AND PARTNER.ORGNUMMER = ? "
    } else if (columnSearch.sequence?.last().equals("HerId")) {
        " AND PARTNER.HER_ID = ? "
    } else if (columnSearch.applyFilterAfterSQL()) {
        log.debug("Innsendt filter '{}' kjøres ETTER at SQL har hentet data", columnSearch.sequence?.last())
        ""
    } else {
        log.warn("Ukjent kolonne for equalSearch: '{}'", columnSearch.sequence?.last())
        ""
    }

private fun ColumnSearch.applyFilterAfterSQL() = this.sequence?.last() in AFTER_SQL_FILTERS

private fun Connection.exeuteAbonnementListeQuery(
    query: String,
    columnSearch: ColumnSearch,
): List<Abonnement> {
    try {
        val preparedStatement = this.prepareStatement(query)
        if (!columnSearch.sok.isNullOrBlank() && !columnSearch.applyFilterAfterSQL()) {
            preparedStatement.setObject(1, columnSearch.sok)
        }
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
    log.debug("DATA-felt fra DB: lengde=${data?.length}, erNull=${data == null}, start='${data?.take(80)}'")
    val helsepersonellData = hentHelsePersonellData(data ?: "")
    return Abonnement(
        endret_dato = getString("endret_dato"),
        slutt_dato = getString("slutt_dato"),
        tssid = getString("key"),
        behandlerInfo = helsepersonellData,
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

internal fun checkForDuplicates(
    abonnementer: List<Abonnement>,
    logger: Logger = log,
) {
    val alleBehandlere = abonnementer.flatMap { it.behandlerInfo }
    val duplikater =
        alleBehandlere
            .groupBy {
                "${it.B_FNavn?.trim()?.lowercase()}|${it.B_FamilieNavn?.trim()?.lowercase()}|${it.B_Hpr?.trim()}|${it.B_Herid?.trim()}"
            }.filter { (_, forekomster) -> forekomster.size > 1 }
    if (duplikater.isNotEmpty()) {
        duplikater.forEach { (_, forekomster) ->
            val b = forekomster.first()
            logger.warn(
                "Duplikat helsepersonell funnet (${forekomster.size} ganger): " +
                    "GivenName='${b.B_FNavn}', FamilyName='${b.B_FamilieNavn}', HPR='${b.B_Hpr}', HerId='${b.B_Herid}'",
            )
        }
    } else {
        logger.info("Ingen duplikate helsepersonell funnet (totalt ${alleBehandlere.size} behandlere).")
    }
}

/**
 * Enkelte filtre kan ikke utføres i SQL fordi informasjonen ligger i ABONNEMENT.DATA-feltet,
 * som er i XML-, Base64 eller Oracle RAW (UpperHex)-format. BehandlerInfo er kjent først etterpå.
 *
 * Løsningen er derfor å filtrere i ettertid, men ulempen her er at søk etter "Johansen" uten å velge
 * filter-felt "BEHANDLER_NAVN", gjør at SQL vil filtrere vekk alle rader som ikke inneholder "Johansen",
 * inkludert de radene der ABONNEMENT.DATA inneholder "Johansen" i XML-format.
 */
internal fun List<Abonnement>.afterSQLFiltering(columnSearch: ColumnSearch): List<Abonnement> {
    if (!columnSearch.applyFilterAfterSQL() || columnSearch.isSearchTextEmpty) return this
    return this
        .map {
            it.copy(
                behandlerInfo =
                    it.behandlerInfo.filter { behandlerInfo ->
                        if (columnSearch.sequence?.last() == "BEHANDLER_NAVN") {
                            columnSearch.searchMatches(listOf(behandlerInfo.B_FNavn, behandlerInfo.B_FamilieNavn))
                        } else if (columnSearch.sequence?.last() == "BEHANDLER_HERID") {
                            columnSearch.searchMatches(listOf(behandlerInfo.B_Herid))
                        } else if (columnSearch.sequence?.last() == "BEHANDLER_HPR") {
                            columnSearch.searchMatches(listOf(behandlerInfo.B_Hpr))
                        } else {
                            false
                        }
                    },
            )
        }.filter { it.behandlerInfo.isNotEmpty() }
}

private fun ColumnSearch.searchMatches(fields: List<String?>): Boolean {
    val searchText = this.sok!!.trim('%')
    for (field in fields) {
        if (field == null) continue
        if (this.isEqual && field.equals(searchText, ignoreCase = true)) return true
        if (this.isStart && field.startsWith(searchText, ignoreCase = true)) return true
        if (this.isContain && field.contains(searchText, ignoreCase = true)) return true
    }
    return false
}
