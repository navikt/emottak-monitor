package no.nav.emottak

import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.nav.emottak.util.hentHelsePersonellData
import org.junit.jupiter.api.Test
import java.util.Base64

class HelsePersonellDataTest {
    private fun encodeXml(xml: String): String = Base64.getEncoder().encodeToString(xml.toByteArray(Charsets.UTF_8))

    private fun encodeUpperHex(xml: String): String = xml.toByteArray(Charsets.UTF_8).joinToString("") { "%02X".format(it) }

    @Test
    fun `hentHelsePersonellData returnerer BehandlerInfo for en HealthcareProfessional i XML`() {
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

        resultat shouldHaveSize 1
        resultat[0].B_FNavn shouldBe "Even Fos"
        resultat[0].B_FamilieNavn shouldBe "Hjelmeland"
        resultat[0].B_Hpr shouldBe "222200081"
        resultat[0].B_Herid shouldBe "2115158"
    }

    @Test
    fun `hentHelsePersonellData returnerer tom liste når XML ikke inneholder HealthcareProfessional-noder`() {
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

        resultat.shouldBeEmpty()
    }

    @Test
    fun `hentHelsePersonellData returnerer BehandlerInfo med tomme felter når HealthcareProfessional mangler tager`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional/>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(encodeXml(xml))

        resultat shouldHaveSize 1
        resultat[0].B_FNavn shouldBe ""
        resultat[0].B_FamilieNavn shouldBe ""
        resultat[0].B_Hpr shouldBe ""
        resultat[0].B_Herid shouldBe ""
    }

    @Test
    fun `hentHelsePersonellData returnerer tom liste ved ugyldig Base64`() {
        val resultat = hentHelsePersonellData("dette er ikke gyldig base64!!!")
        resultat.shouldBeEmpty()
    }

    @Test
    fun `hentHelsePersonellData returnerer tom liste ved tom streng`() {
        val resultat = hentHelsePersonellData("")
        resultat.shouldBeEmpty()
    }

    @Test
    fun `hentHelsePersonellData støtter rå XML`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <HealthcareProfessional>
                    <FamilyName>Normann</FamilyName>
                    <GivenName>Ola</GivenName>
                </HealthcareProfessional>
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(xml)

        resultat shouldHaveSize 1
        resultat[0].B_FNavn shouldBe "Ola"
        resultat[0].B_FamilieNavn shouldBe "Normann"
        resultat[0].B_Hpr shouldBe ""
        resultat[0].B_Herid shouldBe ""
    }

    @Test
    fun `hentHelsePersonellData returnerer tom liste ved ugyldig XML`() {
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <Root>
                <Dette><er>en<ugyldig>XML
            </Root>
            """.trimIndent()

        val resultat = hentHelsePersonellData(xml)
        resultat.shouldBeEmpty()
    }

    @Test
    fun `hentHelsePersonellData støtter UpperHex`() {
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

        resultat shouldHaveSize 1
        resultat[0].B_FNavn shouldBe "Even Fos"
        resultat[0].B_FamilieNavn shouldBe "Hjelmeland"
        resultat[0].B_Hpr shouldBe "222200081"
        resultat[0].B_Herid shouldBe "2115158"
    }

    @Test
    fun `hentHelsePersonellData returnerer tom liste ved ugyldig UpperHex`() {
        val resultat =
            hentHelsePersonellData(
                "3C3F786D6C2076657273696F6E3D22312E302220656E636F64696E673D225554462D38223F3E0A3C526F6F743E0A202020203C4865616C746863617000000000000",
            )
        resultat.shouldBeEmpty()
    }
}
