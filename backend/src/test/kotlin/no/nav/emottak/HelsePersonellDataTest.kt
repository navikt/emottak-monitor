package no.nav.emottak

import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.nav.emottak.model.BehandlerInfo
import no.nav.emottak.util.hentHelsePersonellData
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.util.Base64

class HelsePersonellDataTest {
    private fun encodeXml(xml: String): String = Base64.getEncoder().encodeToString(xml.toByteArray(Charsets.UTF_8))

    @Test
    @Disabled
    fun `hentHelsePersonellData returnerer BehandlerInfo for duplikater`() {
        val resultatListe = mutableListOf<BehandlerInfo>()
        resultatListe.add(BehandlerInfo("Abbas", "Abbasi", "011", "678"))
        resultatListe.add(BehandlerInfo("Parviz", "Parvizi", "021", "679"))
        resultatListe.add(BehandlerInfo("Mamma", "Mammai", "0521", "6781"))
        resultatListe.add(BehandlerInfo("Abbas", "Abbasi", "011", "678"))
        resultatListe.add(BehandlerInfo("Tor", "Grøndahl", "191411842", "2159325"))
        resultatListe.add(BehandlerInfo("Reza", "Rezai", "0992", "32897"))
        resultatListe.add(BehandlerInfo("Tor", "Grøndahl", "191411842", "2159325"))

        val duplikater =
            resultatListe
                .groupBy { "${it.B_FNavn}|${it.B_FamilieNavn}|${it.B_Hpr}|${it.B_Herid}" }
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
    }

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
    @Disabled
    fun `hentHelsePersonellData støtter UpperHex`() {
        // TODO: Lag test som tester å sende inn Oracle RAW: uppercase hex (kun 0-9 og A-F)
    }
}
