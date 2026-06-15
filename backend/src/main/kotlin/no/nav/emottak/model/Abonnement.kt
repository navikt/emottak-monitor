package no.nav.emottak.model

import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.serialization.Serializable

@Serializable
data class BehandlerInfo(
    @get:JsonProperty("B_FNavn")
    val B_FNavn: String? = null,
    @get:JsonProperty("B_FamilieNavn")
    val B_FamilieNavn: String? = null,
    @get:JsonProperty("B_Hpr")
    val B_Hpr: String? = null,
    @get:JsonProperty("B_Herid")
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
    val data: String? = null,
    @get:JsonProperty("BehandlerInfo")
    val BehandlerInfo: List<BehandlerInfo>,
    val partner_id: String? = null,
    val ab_id: Long,
)

@Serializable
data class AbonnementListeData(
    val abonnementListe: List<Abonnement>,
    val totalNumberOfEntries: Long,
)
