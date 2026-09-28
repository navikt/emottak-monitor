package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.ResultSet
import java.time.LocalDateTime

val log: Logger = LoggerFactory.getLogger("no.nav.emottak.emottakMonitor")

fun DatabaseInterface.hentHendelser(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    pageable: Pageable? = null,
    role: String? = null,
    service: String? = null,
    action: String? = null,
    hendelsedeskr: String? = null,
): Page<HendelseInfo> =
    connection.use { connection ->
        var filterClause = ""
        if (!role.isNullOrBlank()) filterClause += " AND MELDING.ROLE = ?"
        if (!service.isNullOrBlank()) filterClause += " AND MELDING.SERVICE = ?"
        if (!action.isNullOrBlank()) filterClause += " AND MELDING.ACTION = ?"
        if (!hendelsedeskr.isNullOrBlank()) filterClause += " AND HENDELSE.HENDELSEDESKR = ?"

        fun setFilterParams(
            statement: java.sql.PreparedStatement,
            startIndex: Int,
        ): Int {
            var index = startIndex
            if (!role.isNullOrBlank()) statement.setObject(index++, role)
            if (!service.isNullOrBlank()) statement.setObject(index++, service)
            if (!action.isNullOrBlank()) statement.setObject(index++, action)
            if (!hendelsedeskr.isNullOrBlank()) statement.setObject(index++, hendelsedeskr)
            return index
        }

        val countStatement =
            connection.prepareStatement(
                """
                SELECT count(*)
                FROM $databasePrefix.LOGG, $databasePrefix.MELDING, $databasePrefix.HENDELSE
                WHERE LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID AND MELDING.MOTTAK_ID = LOGG.MOTTAK_ID
                AND LOGG.HENDELSEDATO BETWEEN ? AND ?
                $filterClause
            """,
            )
        countStatement.setObject(1, fom)
        countStatement.setObject(2, tom)
        setFilterParams(countStatement, 3)
        val totalCount =
            countStatement.use {
                val rs = it.executeQuery()
                rs.next()
                rs.getLong(1)
            }

        var sql =
            """
            SELECT LOGG.HENDELSEDATO, HENDELSE.HENDELSEDESKR, LOGG.TILLEGSINFO, LOGG.MOTTAK_ID, MELDING.EBCONVERS_ID,
            MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION,  MELDING.STATUSLEVEL, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN AS AVSENDER
            FROM $databasePrefix.MELDING
            JOIN $databasePrefix.LOGG ON MELDING.MOTTAK_ID = LOGG.MOTTAK_ID
            JOIN $databasePrefix.HENDELSE ON LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID
            WHERE LOGG.HENDELSEDATO BETWEEN ? AND ?
            $filterClause
            """.trimIndent()

        var orderBy = "DESC"
        if (pageable != null && pageable.sort != null) {
            orderBy = pageable.sort
        }
        sql = "$sql ORDER BY LOGG.HENDELSEDATO $orderBy, MELDING.EBCONVERS_ID, LOGG.MOTTAK_ID"

        if (pageable != null) {
            sql = "$sql OFFSET ? ROWS FETCH NEXT ? ROWS ONLY "
        }
        val statement = connection.prepareStatement(sql)
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        val nextIndex = setFilterParams(statement, 3)
        if (pageable != null) {
            statement.setObject(nextIndex, pageable.offset)
            statement.setObject(nextIndex + 1, pageable.pageSize)
        }
        val list =
            statement
                .use {
                    it.executeQuery().toList { toHendelseInfo() }
                }.toList()
        var returnPageable = pageable
        if (returnPageable == null) returnPageable = Pageable(1, list.size)
        Page(returnPageable.pageNumber, returnPageable.pageSize, returnPageable.sort, totalCount, list)
    }

fun ResultSet.toHendelseInfo(): HendelseInfo =
    HendelseInfo(
        getString("HENDELSEDATO"),
        getString("HENDELSEDESKR"),
        getString("TILLEGSINFO"),
        getString("MOTTAK_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("AVSENDER"),
        getString("EBCONVERS_ID"),
        statuslevel = getString("STATUSLEVEL"),
    )
