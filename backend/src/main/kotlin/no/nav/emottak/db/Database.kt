package no.nav.emottak.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.nav.emottak.Environment
import no.nav.emottak.VaultSecrets
import java.sql.Connection
import java.sql.ResultSet

class Database(
    private val env: Environment,
    private val vaultCredentials: VaultSecrets,
) : DatabaseInterface {
    private val dataSource: HikariDataSource =
        HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = env.databaseUrl
                username = vaultCredentials.databaseUsername
                password = vaultCredentials.databasePassword
                maximumPoolSize = 3
                isAutoCommit = false
                driverClassName = "oracle.jdbc.OracleDriver"
                validate()
            },
        )

    override val connection: Connection
        get() = dataSource.connection
}

fun <T> ResultSet.toList(mapper: ResultSet.() -> T) =
    mutableListOf<T>().apply {
        while (next()) {
            add(mapper())
        }
    }

interface DatabaseInterface {
    val connection: Connection
}
