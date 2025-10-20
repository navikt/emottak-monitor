package no.nav.emottak.model

data class CpaListe(
    val cpaId: String? = null,
    val partnerID: String? = null,
    val navCppID: String? = null,
    val partnerCppID: String? = null,
    val partnerSubjectDN: String? = null,
    val partnerEndpoint: String? = null,
    val lastUsed: String? = null,
)
