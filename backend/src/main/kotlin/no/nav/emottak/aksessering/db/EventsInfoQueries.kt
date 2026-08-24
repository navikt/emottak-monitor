package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentHendelser(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    pageable: Pageable? = null,
): Page<HendelseInfo> =
    connection.use { connection ->
        val countStatement =
            connection.prepareStatement(
                """
                SELECT count(*)
                FROM $databasePrefix.LOGG, $databasePrefix.MELDING, $databasePrefix.HENDELSE
                WHERE LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID AND MELDING.MOTTAK_ID = LOGG.MOTTAK_ID
                AND LOGG.HENDELSEDATO BETWEEN ? AND ?
            """,
            )
        countStatement.setObject(1, fom)
        countStatement.setObject(2, tom)
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
        if (pageable != null) {
            statement.setObject(3, pageable.offset)
            statement.setObject(4, pageable.pageSize)
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
