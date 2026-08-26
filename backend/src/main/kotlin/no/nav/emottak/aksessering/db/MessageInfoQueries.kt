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
    mottakId: String? = null,
    cpaId: String? = null,
    messageId: String? = null,
    pageable: Pageable? = null,
): Page<MessageInfo> =
    connection.use { connection ->
        var filterClause = ""
        if (!mottakId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.MOTTAK_ID) LIKE '%${mottakId.lowercase()}%'"
        if (!cpaId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.AVTALE_ID) LIKE '%${cpaId.lowercase()}%'"
        if (!messageId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.EBMESAGE_ID) LIKE '%${messageId.lowercase()}%'"

        val countStatement =
            connection.prepareStatement(
                """
                SELECT COUNT(DISTINCT MELDING_FILTER.EBCONVERS_ID)
                    FROM $databasePrefix.MELDING MELDING_FILTER
                    WHERE MELDING_FILTER.DATOMOTTAT BETWEEN ? AND ? AND MELDING_FILTER.EBCONVERS_ID IS NOT NULL
                    $filterClause
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

        // We always use ORDER BY, with default DESC
        var orderBy = "DESC"
        if (pageable != null) {
            orderBy = pageable.sort
        }

        var groupSql = """
                        SELECT MELDING_FILTER.EBCONVERS_ID
                        FROM $databasePrefix.MELDING MELDING_FILTER
                        WHERE MELDING_FILTER.DATOMOTTAT BETWEEN ? AND ? AND MELDING_FILTER.EBCONVERS_ID IS NOT NULL
                        $filterClause
                    GROUP BY MELDING_FILTER.EBCONVERS_ID
                    ORDER BY MAX(MELDING_FILTER.DATOMOTTAT) $orderBy
                """
        // We only use LIMIT and OFFSET when asked for a page
        if (pageable != null) {
            groupSql += " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY "
        }

        val sql = """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.EBCONVERS_ID,
                    MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT COUNT(*) FROM $databasePrefix.LOGG WHERE (MELDING.MOTTAK_ID = LOGG.MOTTAK_ID)) AS ANTALL,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING
                    WHERE MELDING.EBCONVERS_ID IN ($groupSql)
                    ORDER BY MAX(MELDING.DATOMOTTAT) OVER (PARTITION BY MELDING.EBCONVERS_ID) $orderBy, MELDING.DATOMOTTAT ASC
                """
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
        getString("MOTTAK_ID"),
        getString("EBCONVERS_ID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("EBCOMNAVN"),
        getString("CPA_ID"),
        getInt("ANTALL"),
        getString("STATUS"),
    )
