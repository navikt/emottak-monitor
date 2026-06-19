package no.nav.emottak.aksessering.db

import io.ktor.http.decodeURLQueryComponent
import no.nav.emottak.log
import java.sql.Connection
import kotlin.text.contains
import kotlin.use

internal fun getColumnSearch(columnSearchEncoded: String): ColumnSearch {
    val columnSearch = columnSearchEncoded.decodeURLQueryComponent()
    log.debug("columnSearch: '$columnSearch'")
    return ColumnSearch.createInstance(columnSearch)
}

data class ColumnSearch(
    val sok: String?,
    val sequence: Sequence<String>?,
    val isSearchTextEmpty: Boolean,
    val isSearchColnEmpty: Boolean,
    val isEqual: Boolean,
    val isStart: Boolean,
    val isContain: Boolean,
) {
    companion object {
        fun createInstance(inputString: String): ColumnSearch {
            val sequence = inputString.splitToSequence("¤")
            log.debug("Sequence: {}", sequence.toList())

            val isSearchTextEmpty: Boolean = sequence.first() == ""
            val isSearchColnEmpty: Boolean = sequence.last() == "" || sequence.last() == "TOMT"
            val isEqual: Boolean = inputString.contains("er lik")
            val isStart: Boolean = inputString.contains("starter med")
            val isContain: Boolean = inputString.contains("inneholder")
            var sok: String? = ""

            if (!isSearchTextEmpty) {
                if (isStart) {
                    sok = sequence.first() + "%"
                } else if (isContain) {
                    sok = "%" + sequence.first() + "%"
                } else if (isEqual) {
                    sok = sequence.first()
                }
            }

            if (sequence.first().contains("999999")) {
                sok = "999999"
            }
            log.info("Sok: '$sok'")
            return ColumnSearch(sok, sequence, isSearchTextEmpty, isSearchColnEmpty, isEqual, isStart, isContain)
        }
    }
}

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
