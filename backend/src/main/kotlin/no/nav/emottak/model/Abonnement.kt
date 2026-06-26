package no.nav.emottak.model

import kotlinx.serialization.Serializable

@Serializable
data class BehandlerInfo(
    val fornavn: String? = null,
    val etternavn: String? = null,
    val hpr: String? = null,
    val herId: String? = null,
)

@Serializable
data class Abonnement(
    val partnerNavn: String,
    val partnerOrgnr: String,
    val partnerHerId: String? = null,
    val endretDato: String? = null,
    val sluttDato: String? = null,
    val tssId: String? = null,
    val behandlerInfo: BehandlerInfo?,
    val partnerId: String? = null,
    val abId: Long,
)

@Serializable
data class AbonnementListeData(
    val abonnementListe: List<Abonnement>,
    val totalNumberOfEntries: Long,
)
