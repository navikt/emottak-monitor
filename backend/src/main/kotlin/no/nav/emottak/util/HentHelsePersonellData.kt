package no.nav.emottak.util

import no.nav.emottak.log
import no.nav.emottak.model.BehandlerInfo
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.ErrorHandler
import org.xml.sax.SAXParseException
import java.io.ByteArrayInputStream
import java.util.Base64
import javax.xml.parsers.DocumentBuilderFactory

fun hentHelsePersonellData(data: String): List<BehandlerInfo> {
    if (data.isBlank()) return emptyList()
    val xmlBytes = decodeToXmlBytes(data.trim()) ?: return emptyList()
    return parseHealthcareProfessionals(xmlBytes)
}

/**
 * Forsøker å dekode data i rekkefølge:
 * 1. Oracle RAW via getString() returnerer uppercase hex -> hex-dekod til bytes
 * 2. Standard Base64 -> bytes
 * 3. Rå UTF-8 XML-streng
 * Returnerer null hvis ingen strategi gir gyldig XML-start.
 */
private fun decodeToXmlBytes(data: String): ByteArray? {
    // Oracle RAW-kolonner via JDBC getString() returneres som uppercase hex (kun 0-9 og A-F)
    if (isUpperHex(data)) {
        hexToBytes(data)?.let { hexDecoded ->
            if (looksLikeXml(hexDecoded)) return hexDecoded
            // Hex-dekodet innhold kan igjen være Base64-kodet XML
            runCatching { Base64.getDecoder().decode(hexDecoded) }
                .getOrNull()
                ?.takeIf { looksLikeXml(it) }
                ?.let { return it }
        }
    }

    // Standard Base64-kodet XML
    if (isBase64(data)) {
        runCatching { Base64.getDecoder().decode(data) }
            .getOrNull()
            ?.takeIf { looksLikeXml(it) }
            ?.let { return it }
    }

    // Rå XML-streng (VARCHAR2/CLOB med XML direkte)
    val raw = data.toByteArray(Charsets.UTF_8)
    if (looksLikeXml(raw)) return raw

    log.warn("Kunne ikke tolke DATA-feltet som XML (lengde=${data.length}, start='${data.take(40)}')")
    return null
}

private fun isUpperHex(data: String): Boolean = data.length % 2 == 0 && data.all { it in '0'..'9' || it in 'A'..'F' }

private fun isBase64(data: String): Boolean = data.matches(Regex("[A-Za-z0-9+/=\\r\\n]+"))

private fun hexToBytes(hex: String): ByteArray? =
    runCatching {
        ByteArray(hex.length / 2) { i ->
            ((hex[i * 2].digitToInt(16) shl 4) + hex[i * 2 + 1].digitToInt(16)).toByte()
        }
    }.getOrNull()

private fun looksLikeXml(bytes: ByteArray): Boolean {
    if (bytes.size < 3) return false
    // Hopp over UTF-8 BOM (EF BB BF) om den finnes
    val offset = if (bytes[0] == 0xEF.toByte() && bytes[1] == 0xBB.toByte() && bytes[2] == 0xBF.toByte()) 3 else 0
    return bytes
        .drop(offset)
        .firstOrNull { it != ' '.code.toByte() && it != '\n'.code.toByte() && it != '\r'.code.toByte() } == '<'.code.toByte()
}

private fun parseHealthcareProfessionals(xmlBytes: ByteArray): List<BehandlerInfo> =
    try {
        val factory =
            DocumentBuilderFactory.newInstance().also {
                it.isNamespaceAware = true
            }
        val builder = factory.newDocumentBuilder()
        builder.setErrorHandler(
            object : ErrorHandler {
                override fun warning(e: SAXParseException) = log.warn("XML advarsel: ${e.message}")

                override fun error(e: SAXParseException) = log.warn("XML feil: ${e.message}")

                override fun fatalError(e: SAXParseException): Unit = throw e
            },
        )

        val doc = builder.parse(ByteArrayInputStream(xmlBytes))
        doc.documentElement.normalize()

        // Henter kun HealthcareProfessional-noder
        val nodeList = doc.getElementsByTagNameNS("*", "HealthcareProfessional")
        if (nodeList.length == 0) {
            log.warn("Ingen HealthcareProfessional-noder funnet. Rotnode: <${doc.documentElement.tagName}>")
        }
        val resultatListe = mutableListOf<BehandlerInfo>()

        for (i in 0 until nodeList.length) {
            val node = nodeList.item(i)
            if (node.nodeType != Node.ELEMENT_NODE) continue
            val element = node as Element

            val givenName =
                (
                    element.getElementsByTagNameNS("*", "GivenName").item(0)?.textContent
                        ?: element.getElementsByTagName("GivenName").item(0)?.textContent ?: ""
                ).trim()

            val familyName =
                (
                    element.getElementsByTagNameNS("*", "FamilyName").item(0)?.textContent
                        ?: element.getElementsByTagName("FamilyName").item(0)?.textContent ?: ""
                ).trim()

            var hprNr = ""
            var herId = ""

            // Endret: Hent Ident-noder som ligger *direkte* under denne HealthcareProfessional
            val childNodes = element.childNodes
            for (j in 0 until childNodes.length) {
                val child = childNodes.item(j)
                if (child.nodeType != Node.ELEMENT_NODE || (child.localName != "Ident" && child.nodeName != "Ident")) continue
                val identElement = child as Element

                val typeIdNode =
                    identElement.getElementsByTagNameNS("*", "TypeId").item(0) as? Element
                        ?: identElement.getElementsByTagName("TypeId").item(0) as? Element

                if (typeIdNode != null) {
                    val id =
                        (
                            identElement.getElementsByTagNameNS("*", "Id").item(0)?.textContent
                                ?: identElement.getElementsByTagName("Id").item(0)?.textContent ?: ""
                        ).trim()

                    // Sjekker attributtet "V" for å skille på HER og HPR
                    when (typeIdNode.getAttribute("V")) {
                        "HPR" -> hprNr = id
                        "HER" -> herId = id
                    }
                }
            }

            resultatListe.add(BehandlerInfo(givenName, familyName, hprNr, herId))
        }

        // Logging av resultater
        resultatListe.forEachIndexed { idx, b ->
            log.info("  [$idx] GivenName='${b.B_FNavn}', FamilyName='${b.B_FamilieNavn}', HPR='${b.B_Hpr}', HerId='${b.B_Herid}'")
        }

        // Duplikatsjekk: Krever full match på navn, etternavn, HPR og HER
        val duplikater =
            resultatListe
                .groupBy { "${it.B_FNavn!!.lowercase()}|${it.B_FamilieNavn!!.lowercase()}|${it.B_Hpr}|${it.B_Herid}" }
                .filter { (_, forekomster) -> forekomster.size > 1 }

        if (duplikater.isNotEmpty()) {
            duplikater.forEach { (_, forekomster) ->
                val behandler = forekomster.first()
                log.warn(
                    "Duplikat helsepersonell funnet (${forekomster.size} ganger): " +
                        "GivenName='${behandler.B_FNavn}', FamilyName='${behandler.B_FamilieNavn}', " +
                        "HPR='${behandler.B_Hpr}', HerId='${behandler.B_Herid}'",
                )
            }
        } else {
            log.info("Ingen duplikater funnet i helsepersonell-listen.")
        }

        resultatListe
    } catch (e: Exception) {
        log.error("Feil ved parsing av HealthcareProfessional XML: ${e.message}", e)
        emptyList()
    }
