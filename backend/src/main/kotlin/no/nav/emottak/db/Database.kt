package no.nav.emottak.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import java.sql.Connection
import java.sql.ResultSet

class Database(
    private val dbConfig: no.nav.emottak.configuration.Database,
    private val vaultCredentials: VaultSecrets,
) : DatabaseInterface {
    private val dataSource: HikariDataSource =
        HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = dbConfig.url.value
                username = vaultCredentials.databaseUsername
                password = vaultCredentials.databasePassword
                maximumPoolSize = dbConfig.maximumPoolSize.value
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

data class VaultSecrets(
    val databaseUsername: String,
    val databasePassword: String,
)
