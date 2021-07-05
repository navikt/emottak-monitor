package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.RoleInfo
import no.nav.emottak.model.ServiceInfo
import java.sql.ResultSet
import java.time.LocalDateTime


fun DatabaseInterface.getService(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<ServiceInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                    SELECT DISTINCT SERVICE FROM $databasePrefix.MELDING 
                    WHERE DATOMOTTAT between ? and ?
                    AND SERVICE is not null
                """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toServiceInfo() }
        }
    }

fun ResultSet.toServiceInfo(): ServiceInfo =
    ServiceInfo(
        getString("SERVICE")
    )
