package no.nav.emottak

import java.time.LocalDateTime
import no.nav.emottak.util.getFileAsString
import no.nav.syfo.db.Database
import no.nav.syfo.services.MessageQueryService

object FetchDatabase {
    val environment = Environment()

    private val databaseVaultSecrets = VaultCredentials(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username")
    )

    val database = Database(environment, databaseVaultSecrets)
    private val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    fun fetchMeldinger(fom: LocalDateTime, tom: LocalDateTime) =
        messageQueryService.hentMeldinger(fom, tom)
}
