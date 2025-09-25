package no.nav.emottak

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.nav.emottak.db.DatabaseInterface
import java.sql.Connection
import java.sql.ResultSet
import javax.sql.DataSource

class TestDatabase : DatabaseInterface {
    private val dataSource: DataSource =
        HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1"
                username = "sa"
                password = ""
                maximumPoolSize = 3
//                isAutoCommit = false
                driverClassName = "org.h2.Driver"
                validate()
            },
        )

    val prefix = "PUBLIC" // Default for H2

    override val connection: Connection
        get() = dataSource.connection

    fun runSqlScript(path: String) {
        javaClass
            .getResourceAsStream(path)
            .bufferedReader()
            .use { reader ->
                for (sql in reader.readText().split(';')) {
                    if (sql.any { it.isLetterOrDigit() }) {
                        runSql(sql)
                    }
                }
            }
    }

    fun runSql(sql: String) {
        connection.use {
            it.prepareStatement(sql).use {
                val c = it.executeUpdate()
//                println("Got $c after executing $sql")
            }
        }
    }
}

fun <T> ResultSet.toList(mapper: ResultSet.() -> T) =
    mutableListOf<T>().apply {
        while (next()) {
            add(mapper())
        }
    }
