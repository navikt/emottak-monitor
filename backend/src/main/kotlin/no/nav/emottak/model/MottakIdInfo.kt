package no.nav.emottak.model

data class MottakIdInfo(
    val datoMottatt: String,
    val mottakId: String,
    val requestId: String? = null,
    val role: String? = null,
    val service: String? = null,
    val action: String? = null,
    val ebcomnavn: String? = null,
    val cpaId: String? = null,
    val status: String? = null,
    val meldingsparam: String? = null,
    val refparam: String? = null,
    val avsenderparam: String? = null,
    val conversationId: String? = null,
    val messageId: String? = null,
    val certdn: String? = null,
    val trustdn: String? = null,
    val docsignerdn: String? = null,
    val docsignerissuerdn: String? = null,
)
