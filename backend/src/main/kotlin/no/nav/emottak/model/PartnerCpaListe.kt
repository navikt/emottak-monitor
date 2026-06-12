package no.nav.emottak.model

import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.serialization.Serializable

@Serializable
data class PartnerCpaListe(
    val partnerName: String? = null,
    val partnerSubjectDN: String? = null,
    val partnerID: String? = null,
    val herID: String? = null,
    val orgNummer: String? = null,
    val cpaID: String? = null,
    val navCppID: String? = null,
    val partnerCppID: String? = null,
    val partnerEndpoint: String? = null,
    val komSystem: String? = null,
    var lastUsed: String? = null,
    var lastUsedEbms: String? = null,
)

@Serializable
data class PartnerCpaListeData(
    val partnerCpaListe: List<PartnerCpaListe>,
    val totalNumberOfEntries: Long,
)

@Serializable
data class CpaListe(
    val partnerSubjectDN: String? = null,
    val cpaID: String? = null,
    val navCppID: String? = null,
    val partnerCppID: String? = null,
    val partnerEndpoint: String? = null,
    var lastUsed: String? = null,
    var lastUsedEbms: String? = null,
)

@Serializable
data class PartnerListe(
    val partnerName: String,
    val partnerID: String,
    val herID: String,
    val orgNummer: String,
    val komSystem: String? = null,
    val cpaListe: List<CpaListe>,
)

@Serializable
data class PartnerListeData(
    val partnerListe: List<PartnerListe>,
    val totalNumberOfEntries: Long,
)

@Serializable
data class AbonnementListeData(
    val abonnementListe: List<Abonnement>,
    val totalNumberOfEntries: Long,
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
