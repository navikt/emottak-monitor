package no.nav.emottak.aksessering.db

import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.db.toList
import no.nav.emottak.model.HendelseInfo
import no.nav.emottak.model.MeldingInfo
import java.sql.ResultSet
import java.time.LocalDateTime

fun DatabaseInterface.hentHendelser(
    databasePrefix: String,
    fom: LocalDateTime,
    tom: LocalDateTime
): List<HendelseInfo> =
    connection.use { connection ->
        val statement = connection.prepareStatement(
            """
                SELECT LOGG.HENDELSEDATO, HENDELSE.HENDELSEDESKR, LOGG.TILLEGSINFO, LOGG.MOTTAK_ID, MELDING.ROLE,
                MELDING.SERVICE, MELDING.ACTION, MELDING.REFERANSEPARAM, MELDING.EBCOMNAVN AS AVSENDER
                FROM LOGG, MELDING, HENDELSE
                WHERE LOGG.HENDELSE_ID = HENDELSE.HENDELSE_ID AND MELDING.MOTTAK_ID = LOGG.MOTTAK_ID
                AND LOGG.HENDELSEDATO BETWEEN ? AND ?
                ORDER BY LOGG.HENDELSEDATO DESC;
            """
        )
        statement.setObject(1, fom)
        statement.setObject(2, tom)
        statement.use {
            it.executeQuery().toList { toHendelseInfo() }
        }
    }

fun ResultSet.toHendelseInfo(): HendelseInfo =
    HendelseInfo(
        getString("HENDELSEDATO"),
        getString("HENDELSEDESKR"),
        getString("TILLEGSINFO"),
        getString("MOTTAKID"),
        getString("ROLE"),
        getString("SERVICE"),
        getString("ACTION"),
        getString("REFERANSEPARAM"),
        getString("AVSENDER")
    )
