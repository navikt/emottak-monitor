package no.nav.emottak.db

fun DatabaseInterface.hentMelinger(
    databasePrefix: String
): List<String> =
        connection.use { connection ->
            connection.prepareStatement(
                    """
                        SELECT * FROM $databasePrefix.MELDING melding
                        WHERE melding.DATO_MOTTATT >= sysdate)
                """
            ).use {
                it.executeQuery().toList { String() }
            }
        }
