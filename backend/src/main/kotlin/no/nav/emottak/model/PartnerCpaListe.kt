package no.nav.emottak.model
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
