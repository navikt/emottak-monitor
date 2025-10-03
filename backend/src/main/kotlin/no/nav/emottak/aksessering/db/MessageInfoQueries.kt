package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    pageable: Pageable? = null,
): Page<MessageInfo> =
    connection.use { connection ->
        val countStatement =
            connection.prepareStatement( // todo does this count the same rows as the query below ???
                """
                SELECT count(*)
                    FROM $databasePrefix.MELDING
                    WHERE MELDING.DATOMOTTAT BETWEEN ? AND ? AND MELDING.EBCONVERS_ID IS NOT NULL
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

        var sql = """
                    SELECT MELDING.DATOMOTTAT, (SELECT LISTAGG(MELDING2.MOTTAK_ID, ',') WITHIN GROUP(ORDER BY MELDING2.EBCONVERS_ID) FROM $databasePrefix.MELDING MELDING2
                    WHERE MELDING2.EBCONVERS_ID = MELDING.EBCONVERS_ID GROUP BY MELDING2.EBCONVERS_ID) AS MOTTAK_ID_LISTE,
                    MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT COUNT(*) FROM $databasePrefix.LOGG WHERE (MELDING.MOTTAK_ID = LOGG.MOTTAK_ID)) AS ANTALL,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING
                    WHERE MELDING.DATOMOTTAT BETWEEN ? AND ? AND MELDING.EBCONVERS_ID IS NOT NULL
                """
        if (pageable != null) {
            if (pageable.sort != null) {
                val orderBy = " ORDER BY MELDING.DATOMOTTAT " + pageable.sort
                sql = sql + orderBy
            }
            sql = sql + " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY "
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
                    it.executeQuery().toList { toMessageInfo() }
                }.toList()
        var returnPageable = pageable
        if (returnPageable == null) returnPageable = Pageable(1, list.size)
        Page(returnPageable.pageNumber, returnPageable.pageSize, returnPageable.sort, totalCount, list)
    }

fun ResultSet.toMessageInfo(): MessageInfo =
    MessageInfo(
        getString("DATOMOTTAT"),
        getString("MOTTAK_ID_LISTE"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CPA_ID"),
        getInt("ANTALL"),
        getString("STATUS"),
    )
