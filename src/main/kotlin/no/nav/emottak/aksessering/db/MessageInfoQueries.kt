package no.nav.syfo.aksessering.db

import java.sql.ResultSet
import no.nav.syfo.db.DatabaseInterface
import no.nav.syfo.db.toList
import no.nav.syfo.services.MeldingInfo

fun DatabaseInterface.hentMeldinger(
    databasePrefix: String
): List<MeldingInfo> =
        connection.use { connection ->
            connection.prepareStatement(
                    """
                SELECT MOTTAK_ID FROM $databasePrefix.MELDING
                WHERE ROLE = 'Sykmelder'
                AND SERVICE = 'Sykmelding'
                AND ACTION = 'Registrering'
                """
            ).use {
                it.executeQuery().toList { toMeldingInfo() }
            }
        }

fun ResultSet.toMeldingInfo(): MeldingInfo =
        MeldingInfo(
                getString("MOTTAK_ID")
        )
