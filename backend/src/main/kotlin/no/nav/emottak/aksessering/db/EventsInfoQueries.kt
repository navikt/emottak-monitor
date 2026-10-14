package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.convertStatus
import java.sql.ResultSet
import java.time.LocalDateTime

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
        var index = 3
        index = setFilterEqualsParams(countStatement, index, role)
        index = setFilterEqualsParams(countStatement, index, service)
        index = setFilterEqualsParams(countStatement, index, action)
        setFilterEqualsParams(countStatement, index, hendelsedeskr)
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
        if (pageable != null) {
            orderBy = pageable.sort
        }
        sql = "$sql ORDER BY LOGG.HENDELSEDATO $orderBy, MELDING.EBCONVERS_ID, LOGG.MOTTAK_ID"

        if (pageable != null) {
            sql = "$sql OFFSET ? ROWS FETCH NEXT ? ROWS ONLY "
        }
        val statement = connection.prepareStatement(sql)
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        index = 3
        index = setFilterEqualsParams(countStatement, index, role)
        index = setFilterEqualsParams(countStatement, index, service)
        index = setFilterEqualsParams(countStatement, index, action)
        index = setFilterEqualsParams(countStatement, index, hendelsedeskr)
        if (pageable != null) {
            statement.setObject(index, pageable.offset)
            statement.setObject(index + 1, pageable.pageSize)
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
        statuslevel = convertStatus(getString("STATUSLEVEL")),
    )
