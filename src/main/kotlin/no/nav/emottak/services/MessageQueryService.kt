package no.nav.emottak.services

import no.nav.emottak.aksessering.db.getActions
import no.nav.emottak.aksessering.db.getRoles
import no.nav.emottak.aksessering.db.getServices
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.db.DatabaseInterface
import no.nav.emottak.model.ActionInfo
import no.nav.emottak.model.MeldingInfo
import no.nav.emottak.model.RoleInfo
import no.nav.emottak.model.ServiceInfo
import java.time.LocalDateTime

class MessageQueryService(
    private val databaseInterface: DatabaseInterface,
    private val databasePrefix: String
) {
    fun meldinger(fom: LocalDateTime, tom: LocalDateTime): List<MeldingInfo> =
        databaseInterface.hentMeldinger(databasePrefix, fom, tom)
    fun role(fom: LocalDateTime, tom: LocalDateTime): List<RoleInfo> =
        databaseInterface.getRoles(databasePrefix, fom, tom)
    fun service(fom: LocalDateTime, tom: LocalDateTime): List<ServiceInfo> =
        databaseInterface.getServices(databasePrefix, fom, tom)
    fun action(fom: LocalDateTime, tom: LocalDateTime): List<ActionInfo> =
        databaseInterface.getActions(databasePrefix, fom, tom)
}
