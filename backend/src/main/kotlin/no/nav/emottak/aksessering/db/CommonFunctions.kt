package no.nav.emottak.aksessering.db

import io.ktor.http.decodeURLQueryComponent
import no.nav.emottak.log
import java.sql.Connection
import kotlin.text.contains
import kotlin.use

internal fun getColumnSearch(columnSearchEncoded: String?): ColumnSearch {
    val columnSearch = columnSearchEncoded?.decodeURLQueryComponent()
    log.debug("columnSearch: '$columnSearch'")
    val sequence = columnSearch?.splitToSequence("¤")
    log.debug("Sequence: {}", sequence?.toList())

    val isSearchTextEmpty: Boolean = sequence?.first().equals("")
    val isSearchColnEmpty: Boolean = sequence?.last().equals("") || sequence?.last().equals("TOMT")
    val isEqual: Boolean = columnSearch!!.contains("er lik")
    val isStart: Boolean = columnSearch.contains("starter med")
    val isContain: Boolean = columnSearch.contains("inneholder")
    var sok: String? = ""

    if (!isSearchTextEmpty) {
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
    return ColumnSearch(sok, sequence, isSearchTextEmpty, isSearchColnEmpty, isEqual, isStart, isContain)
}

data class ColumnSearch(
    val sok: String?,
    val sequence: Sequence<String>?,
    val isSearchTextEmpty: Boolean,
    val isSearchColnEmpty: Boolean,
    val isEqual: Boolean,
    val isStart: Boolean,
    val isContain: Boolean,
)

internal fun Connection.executeCountQuery(
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
