package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.MessageInfo
import no.nav.emottak.model.Page
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.convertStatus
import java.sql.Connection
import java.sql.ResultSet
import java.time.LocalDateTime
import kotlin.use

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    mottakId: String? = null,
    cpaId: String? = null,
    messageId: String? = null,
    conversationId: String? = null,
    role: String? = null,
    service: String? = null,
    action: String? = null,
    status: String? = null,
    pageable: Pageable? = null,
): Page<MessageInfo> =
    connection.use { connection ->
        var filterClause = ""
        if (!mottakId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.MOTTAK_ID) LIKE ?"
        if (!cpaId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.AVTALE_ID) LIKE ?"
        if (!messageId.isNullOrBlank()) filterClause += " AND LOWER(MELDING_FILTER.EBMESAGE_ID) LIKE ?"
        if (!role.isNullOrBlank()) filterClause += " AND MELDING_FILTER.ROLE = ?"
        if (!service.isNullOrBlank()) filterClause += " AND MELDING_FILTER.SERVICE = ?"
        if (!action.isNullOrBlank()) filterClause += " AND MELDING_FILTER.ACTION = ?"
        if (!status.isNullOrBlank()) filterClause += " AND MELDING_FILTER.STATUSLEVEL = ?"

        // Count number of distinct conversationId's only if conversationId is not set:
        var totalCount =
            connection.getTotalCount(
                databasePrefix,
                filterClause,
                fom,
                tom,
                conversationId,
                mottakId,
                cpaId,
                messageId,
                role,
                service,
                action,
                status,
            )

        // We always use ORDER BY, with default DESC
        var orderBy = "DESC"
        if (pageable != null) {
            orderBy = pageable.sort
        }

        val conversationIdSubQuery = getConversationIdSubQuery(databasePrefix, filterClause, orderBy, conversationId, pageable)

        val sql = """
                    SELECT MELDING.DATOMOTTAT, MELDING.MOTTAK_ID, MELDING.EBCONVERS_ID,
                    MELDING.ROLE, MELDING.SERVICE, MELDING.ACTION, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN, MELDING.AVTALE_ID AS CPA_ID,
                    (SELECT COUNT(*) FROM $databasePrefix.LOGG WHERE (MELDING.MOTTAK_ID = LOGG.MOTTAK_ID)) AS ANTALL,
                    (SELECT STATUS.STATUSTEXT FROM $databasePrefix.STATUS WHERE (MELDING.STATUSLEVEL = STATUS.STATUSLEVEL)) AS STATUS
                    FROM $databasePrefix.MELDING
                    WHERE MELDING.EBCONVERS_ID $conversationIdSubQuery
                    ORDER BY MAX(MELDING.DATOMOTTAT) OVER (PARTITION BY MELDING.EBCONVERS_ID) $orderBy, MELDING.DATOMOTTAT ASC
                """
        val statement = connection.prepareStatement(sql)
        if (!conversationId.isNullOrBlank()) {
            statement.setObject(1, conversationId)
        } else {
            var index = 1
            statement.setObject(index++, fom)
            statement.setObject(index++, tom)
            index = setFilterParams(statement, index, mottakId, cpaId, messageId, role, service, action, status)
            if (pageable != null) {
                statement.setObject(index++, pageable.offset)
                statement.setObject(index, pageable.pageSize)
            }
        }
        val list =
            statement
                .use {
                    it.executeQuery().toList { toMessageInfo() }
                }.toList()
        if (!conversationId.isNullOrBlank()) {
            totalCount = if (list.isEmpty()) 0 else 1
        }
        var returnPageable = pageable
        if (returnPageable == null) returnPageable = Pageable(1, list.size)
        Page(returnPageable.pageNumber, returnPageable.pageSize, returnPageable.sort, totalCount, list)
    }

private fun Connection.getTotalCount(
    databasePrefix: String,
    filterClause: String,
    fom: LocalDateTime,
    tom: LocalDateTime,
    conversationId: String?,
    mottakId: String? = null,
    cpaId: String? = null,
    messageId: String? = null,
    role: String?,
    service: String?,
    action: String?,
    status: String?,
): Long =
    if (conversationId.isNullOrBlank()) {
        val countStatement =
            this.prepareStatement(
                """
                        SELECT COUNT(DISTINCT MELDING_FILTER.EBCONVERS_ID)
                            FROM $databasePrefix.MELDING MELDING_FILTER
                            WHERE MELDING_FILTER.DATOMOTTAT BETWEEN ? AND ? AND MELDING_FILTER.EBCONVERS_ID IS NOT NULL
                            $filterClause
                    """,
            )
        countStatement.setObject(1, fom)
        countStatement.setObject(2, tom)
        setFilterParams(countStatement, 3, mottakId, cpaId, messageId, role, service, action, status)
        countStatement.use {
            val rs = it.executeQuery()
            rs.next()
            rs.getLong(1)
        }
    } else {
        0
    }

// Binds the filters (role/service/action/status) parameters in the fixed order they were
// appended to filterClause, returning the next free bind index.
private fun setFilterParams(
    statement: java.sql.PreparedStatement,
    startIndex: Int,
    mottakId: String?,
    cpaId: String?,
    messageId: String?,
    role: String?,
    service: String?,
    action: String?,
    status: String?,
): Int {
    var index = startIndex
    if (!mottakId.isNullOrBlank()) statement.setObject(index++, "%${mottakId.lowercase()}%")
    if (!cpaId.isNullOrBlank()) statement.setObject(index++, "%${cpaId.lowercase()}%")
    if (!messageId.isNullOrBlank()) statement.setObject(index++, "%${messageId.lowercase()}%")
    if (!role.isNullOrBlank()) statement.setObject(index++, role)
    if (!service.isNullOrBlank()) statement.setObject(index++, service)
    if (!action.isNullOrBlank()) statement.setObject(index++, action)
    if (!status.isNullOrBlank()) statement.setObject(index++, status)
    return index
}

private fun getConversationIdSubQuery(
    databasePrefix: String,
    filterClause: String,
    orderBy: String,
    conversationId: String?,
    pageable: Pageable? = null,
): String {
    if (!conversationId.isNullOrBlank()) return "= ?"
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
    return "IN ($groupSql)"
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
        convertStatus(getString("STATUS")),
    )
