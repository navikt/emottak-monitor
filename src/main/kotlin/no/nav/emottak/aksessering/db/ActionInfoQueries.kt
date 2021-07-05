package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.ActionInfo
import no.nav.emottak.model.RoleInfo
import java.sql.ResultSet
import java.time.LocalDateTime


fun DatabaseInterface.getActions(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<ActionInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT DISTINCT ACTION FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT between ? and ?
                    AND ACTION is not null
                """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toActionInfo() }
        }
    }

fun ResultSet.toActionInfo(): ActionInfo =
    ActionInfo(
        getString("ACTION")
    )
