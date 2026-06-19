package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class BehandlerInfo(
    val B_FNavn: String? = null,
    val B_FamilieNavn: String? = null,
    val B_Hpr: String? = null,
    val B_Herid: String? = null,
)

@Serializable
data class Abonnement(
    val partner_navn: String,
    val partner_orgnr: String,
    val partner_herid: String? = null,
    val endret_dato: String? = null,
    val slutt_dato: String? = null,
    val tssid: String? = null,
    val behandlerInfo: List<BehandlerInfo>,
    val partner_id: String? = null,
    val ab_id: Long,
)

@Serializable
data class AbonnementListeData(
    val abonnementListe: List<Abonnement>,
    val totalNumberOfEntries: Long,
)
