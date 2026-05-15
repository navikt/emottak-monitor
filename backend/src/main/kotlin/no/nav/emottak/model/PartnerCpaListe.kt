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

@Serializable
data class CpaListe(
    val partnerSubjectDN: String? = null,
    val cpaID: String? = null,
    val navCppID: String? = null,
    val partnerCppID: String? = null,
    val partnerEndpoint: String? = null,
    val komSystem: String? = null,
    var lastUsed: String? = null,
    var lastUsedEbms: String? = null,
)

@Serializable
data class PartnerListe(
    val partnerName: String,
    val partnerID: String,
    val herID: String,
    val orgNummer: String,
    val cpaListe: List<CpaListe>,
)

@Serializable
data class PartnerListeData(
    val partnerListe: List<PartnerListe>,
    val totalNumberOfEntries: Long,
)
