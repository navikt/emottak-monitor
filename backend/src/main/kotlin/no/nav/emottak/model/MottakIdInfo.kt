package no.nav.emottak.model

data class MottakIdInfo(
    val datomottatt: String,
    val mottakid: String,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val ebcomnavn: String? = null,
    val cpaid: String? = null,
    val status: String? = null,
    val meldingsparam: String? = null,
    val refparam: String? = null,
    val avsenderparam: String? = null,
    val ebconvers_id: String? = null,
    val ebmessage_id: String? = null,
    val certdn: String? = null,
    val trustdn: String? = null,
    val docsignerdn: String? = null,
    val docsignerissuerdn: String? = null,
)
