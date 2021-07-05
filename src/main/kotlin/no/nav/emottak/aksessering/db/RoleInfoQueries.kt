package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.RoleInfo
import java.sql.ResultSet
import java.time.LocalDateTime


fun DatabaseInterface.getRoles(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<RoleInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT DISTINCT ROLE FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT between ? and ?
                    AND ROLE is not null
                """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toRoleInfo() }
        }
    }

fun ResultSet.toRoleInfo(): RoleInfo =
    RoleInfo(
        getString("ROLE")
    )
