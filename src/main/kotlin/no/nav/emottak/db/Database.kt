package no.nav.emottak.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import java.sql.Connection
import java.sql.ResultSet
import no.nav.emottak.Environment
import no.nav.emottak.VaultCredentials

class Database(private val env: Environment, private val vaultCredentialService: VaultCredentials) : DatabaseInterface {

    private val dataSource: HikariDataSource

    override val connection: Connection
        get() = dataSource.connection

    val url = env.databaseUrl

    init {
        dataSource = HikariDataSource(HikariConfig().apply {
            jdbcUrl = env.databaseUrl
            username = vaultCredentialService.databaseUsername
            password = vaultCredentialService.databasePassword
            maximumPoolSize = 3
            isAutoCommit = false
            driverClassName = "oracle.jdbc.OracleDriver"
            validate()
        })
    }
}

fun <T> ResultSet.toList(mapper: ResultSet.() -> T) = mutableListOf<T>().apply {
    while (next()) {
        add(mapper())
    }
}

interface DatabaseInterface {
    val connection: Connection
}
