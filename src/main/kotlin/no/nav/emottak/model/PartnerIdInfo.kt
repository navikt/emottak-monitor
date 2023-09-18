package no.nav.emottak.model

data class PartnerIdInfo(
    val partnerid: String,
    val navn: String,
    val herid: String? = null,
    val orgnummer: String? = null,
    val kommunikasjonssystemid: String,
    val beskrivelse: String,
)
