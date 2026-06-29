package no.nav.emottak

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import no.nav.emottak.util.hentHelsePersonellData
import org.junit.jupiter.api.Test
import java.nio.charset.Charset
import java.util.Base64

class HelsePersonellDataTest {
    private fun encodeXml(
        xml: String,
        charset: Charset = Charsets.UTF_8,
    ): String = Base64.getEncoder().encodeToString(xml.toByteArray(charset))

    private fun encodeUpperHex(xml: String): String = xml.toByteArray(Charsets.UTF_8).joinToString("") { "%02X".format(it) }

    @Test
    fun `hentHelsePersonellData returns BehandlerInfo when HealthcareProfessional found in XML`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>Hjelmeland</FamilyName>
                    <GivenName>Even Fos</GivenName>
                    <Ident>
                        <Id>2115158</Id>
                        <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                    <Ident>
                        <Id>222200081</Id>
                        <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml))

        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Even Fos"
        resultat.etternavn shouldBe "Hjelmeland"
        resultat.hpr shouldBe "222200081"
        resultat.herId shouldBe "2115158"
    }

    @Test
    fun `hentHelsePersonellData returns null when XML does not contains HealthcareProfessional-nodes`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <Organisation>
                    <Name>Test AS</Name>
                </Organisation>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml))

        resultat shouldBe null
    }

    @Test
    fun `hentHelsePersonellData returns BehandlerInfo with empty fields when HealthcareProfessional-node is missing tags`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional/>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml))

        resultat shouldNotBe null
        resultat!!.fornavn shouldBe ""
        resultat.etternavn shouldBe ""
        resultat.hpr shouldBe ""
        resultat.herId shouldBe ""
    }

    @Test
    fun `hentHelsePersonellData returns null when invalid Base64`() {
        val resultat = hentHelsePersonellData("dette er ikke gyldig base64!!!")
        resultat shouldBe null
    }

    @Test
    fun `hentHelsePersonellData returns null when string is empty`() {
        val resultat = hentHelsePersonellData("")
        resultat shouldBe null
    }

    @Test
    fun `hentHelsePersonellData supports raw XML as input (UTF-8)`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>Normann</FamilyName>
                    <GivenName>Åse</GivenName>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(xml)

        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Åse"
        resultat.etternavn shouldBe "Normann"
        resultat.hpr shouldBe ""
        resultat.herId shouldBe ""
    }

    @Test
    fun `hentHelsePersonellData returns null when invalid XML`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <Dette><er>en<ugyldig>XML
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(xml)
        resultat shouldBe null
    }

    @Test
    fun `hentHelsePersonellData supports UpperHex as input`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>Hjelmeland</FamilyName>
                    <GivenName>Even Fos</GivenName>
                    <Ident>
                        <Id>2115158</Id>
                        <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                    <Ident>
                        <Id>222200081</Id>
                        <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeUpperHex(xml))

        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Even Fos"
        resultat.etternavn shouldBe "Hjelmeland"
        resultat.hpr shouldBe "222200081"
        resultat.herId shouldBe "2115158"
    }

    @Test
    fun `hentHelsePersonellData returns null when invalid UpperHex`() {
        val resultat =
            hentHelsePersonellData(
                "3C3F786D6C2076657273696F6E3D22312E302220656E636F64696E673D225554462D38223F3E0A3C526F6F743E0A202020203C4865616C746863617000000000000",
            )
        resultat shouldBe null
    }

    @Test
    fun `hentHelsePersonellData returns BehandlerInfo when HealthcareProfessional found in XML (ISO-8859-1)`() {
        val xml =
            """
            <?xml version="1.0" encoding="ISO-8859-1"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>Håland</FamilyName>
                    <GivenName>Ærling</GivenName>
                    <Ident>
                        <Id>123456</Id>
                        <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                    <Ident>
                        <Id>22334455</Id>
                        <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml, Charsets.ISO_8859_1))

        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Ærling"
        resultat.etternavn shouldBe "Håland"
        resultat.hpr shouldBe "22334455"
        resultat.herId shouldBe "123456"
    }

    @Test
    fun `hentHelsePersonellData fixes mojibake in names from Base64 UTF-8 encoded XML`() {
        // Simulates data stored with wrong charset: UTF-8 bytes of ISO-8859-1-misread characters.
        // "SÃ¸dal" is the mojibake result of UTF-8 ø (0xC3 0xB8) being stored as ISO-8859-1.
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>SÃ¸dal</FamilyName>
                    <GivenName>Test</GivenName>
                    <Ident>
                        <Id>123456</Id>
                        <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                    <Ident>
                        <Id>22334455</Id>
                        <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml))
        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Test"
        resultat.etternavn shouldBe "Sødal"
        resultat.hpr shouldBe "22334455"
        resultat.herId shouldBe "123456"
    }

    @Test
    fun `hentHelsePersonellData returns BehandlerInfo when HealthcareProfessional found in XML (Raw XML in ISO-8859-1)`() {
        val xml =
            """
            <?xml version="1.0" encoding="ISO-8859-1"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>SÃ¸dal</FamilyName>
                    <GivenName>Test</GivenName>
                    <Ident>
                        <Id>123456</Id>
                        <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                    <Ident>
                        <Id>22334455</Id>
                        <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                    </Ident>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(xml)
        resultat shouldNotBe null
        resultat!!.fornavn shouldBe "Test"
        resultat.etternavn shouldBe "Sødal"
        resultat.hpr shouldBe "22334455"
        resultat.herId shouldBe "123456"
    }
}
