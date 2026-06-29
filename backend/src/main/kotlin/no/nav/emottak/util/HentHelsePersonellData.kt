package no.nav.emottak.util

import io.ktor.utils.io.charsets.Charset
import io.ktor.utils.io.charsets.forName
import no.nav.emottak.log
import no.nav.emottak.model.BehandlerInfo
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.ErrorHandler
import org.xml.sax.SAXParseException
import java.io.ByteArrayInputStream
import java.util.Base64
import javax.xml.parsers.DocumentBuilderFactory
import kotlin.text.toByteArray

fun hentHelsePersonellData(data: String): BehandlerInfo? {
    if (data.isBlank()) return null
    val xmlBytes = decodeToXmlBytes(data.trim()) ?: return null
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
    val bytes: ByteArray? =
        // Oracle RAW-kolonner via JDBC getString() returneres som uppercase hex (kun 0-9 og A-F)
        if (isUpperHex(data)) {
            hexToBytes(data)
        } // Standard Base64-kodet XML
        else if (isBase64(data)) {
            data.decodeBase64InCorrectCharset()
        } // Rå XML-streng (VARCHAR2/CLOB med XML direkte)
        else {
            data.toByteArray(data.getCharset() ?: Charsets.UTF_8)
        }
    if (looksLikeXml(bytes)) return bytes
    if (bytes != null) {
        try {
            return bytes.decodeBase64InCorrectCharset()
        } catch (e: Exception) {
            log.warn("Forsøkte decode som Base64, men feilet (lengde=${data.length}, start='${data.take(120)}'): ", e)
        }
    } else {
        log.warn("Kunne ikke tolke DATA-feltet som XML (lengde=${data.length}, start='${data.take(120)}')")
        return null
    }
    return bytes
}

private fun isUpperHex(data: String): Boolean = data.length % 2 == 0 && data.all { it in '0'..'9' || it in 'A'..'F' }

private fun isBase64(data: String): Boolean = data.matches(Regex("[A-Za-z0-9+/=\\r\\n]+"))

private fun hexToBytes(hex: String): ByteArray? =
    runCatching {
        ByteArray(hex.length / 2) { i ->
            ((hex[i * 2].digitToInt(16) shl 4) + hex[i * 2 + 1].digitToInt(16)).toByte()
        }
    }.getOrNull()

private fun looksLikeXml(bytes: ByteArray?): Boolean {
    if (bytes == null) return false
    if (bytes.size < 3) return false
    // Hopp over UTF-8 BOM (EF BB BF) om den finnes
    val offset = if (bytes[0] == 0xEF.toByte() && bytes[1] == 0xBB.toByte() && bytes[2] == 0xBF.toByte()) 3 else 0
    return bytes
        .drop(offset)
        .firstOrNull { it != ' '.code.toByte() && it != '\n'.code.toByte() && it != '\r'.code.toByte() } == '<'.code.toByte()
}

private fun String.decodeBase64InCorrectCharset(): ByteArray {
    val bytes = Base64.getDecoder().decode(this)
    val charset = String(bytes).getCharset()
    if (charset != null) return String(bytes, charset).toByteArray(charset)
    return bytes
}

private fun ByteArray.decodeBase64InCorrectCharset(): ByteArray {
    val bytes = Base64.getDecoder().decode(this)
    val charset = String(bytes).getCharset()
    if (charset != null) return String(bytes, charset).toByteArray(charset)
    return bytes
}

private fun String.getCharset(): Charset? {
    if (this.indexOf("encoding=\"") > -1) {
        try {
            val encoding = this.split("encoding=\"")[1].split('"')[0]
            return Charsets.forName(encoding)
        } catch (e: Exception) {
            log.warn("Klarte ikke hente ut tegnsett", e)
        }
    } else {
        log.debug("Fant ikke \"encoding=\" i teksten (lengde=${this.length}, start='${this.take(120)}')")
    }
    return null
}

private fun parseHealthcareProfessionals(xmlBytes: ByteArray): BehandlerInfo? {
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
            return BehandlerInfo(givenName, familyName, hprNr, herId)
        }
        return null
    } catch (e: Exception) {
        log.error("Feil ved parsing av HealthcareProfessional XML: ${e.message}", e)
        log.debug("Deler av ByteArray som feilet: (lengde={}, start='{}')", xmlBytes.size, xmlBytes.take(120))
        return null
    }
}
