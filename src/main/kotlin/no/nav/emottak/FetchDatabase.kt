package no.nav.emottak

import java.time.LocalDateTime
import no.nav.emottak.db.Database
import no.nav.emottak.services.MessageQueryService
import no.nav.emottak.util.getFileAsString

object FetchDatabase {
    private val environment = Environment()

    private val databaseVaultSecrets = VaultCredentials(
        databasePassword = getFileAsString("/secrets/emottak-admin/credentials/password"),
        databaseUsername = getFileAsString("/secrets/emottak-admin/credentials/username")
    )

    private val database = Database(environment, databaseVaultSecrets)
    private val messageQueryService = MessageQueryService(database, environment.databasePrefix)

    fun fetchMessages(fom: LocalDateTime, tom: LocalDateTime) =
        messageQueryService.meldinger(fom, tom)
}
