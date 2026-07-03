package no.nav.emottak.aksessering.db

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import no.nav.emottak.TestDatabase
import no.nav.emottak.services.MessageQueryService

class CpaListeQueriesTest :
    DescribeSpec({
        lateinit var testDatabase: TestDatabase
        lateinit var messageQueryService: MessageQueryService

        beforeSpec {
            testDatabase = TestDatabase()
            testDatabase.runSqlScript("/partner_abonnement_ddl.sql")
            messageQueryService = MessageQueryService(testDatabase, testDatabase.prefix)
            testDatabase.insertTestdata()
        }

        afterSpec {
            testDatabase.runSql("DROP TABLE PARTNER")
        }

        describe("cpaliste") {

            it("should retrieve all CPAs ordered by cpa_id descending") {
                val resultat = messageQueryService.cpaliste("")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 5
                resultat.partnerCpaListe[4].cpaID shouldBe "10101"
                resultat.partnerCpaListe[3].cpaID shouldBe "20202"
                resultat.partnerCpaListe[2].cpaID shouldBe "30303"
                resultat.partnerCpaListe[1].cpaID shouldBe "40404"
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[4].partnerID shouldBe "105"
                resultat.partnerCpaListe[3].partnerID shouldBe "200"
                resultat.partnerCpaListe[2].partnerID shouldBe "300"
                resultat.partnerCpaListe[1].partnerID shouldBe "404"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[4].partnerName shouldBe "Partner 1"
                resultat.partnerCpaListe[3].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[2].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
            }

            it("numeric search without column should search in all fields (exact)") {
                val resultat = messageQueryService.cpaliste("105¤er lik¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[0].orgNummer shouldBe "105" // Text match
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[1].partnerID shouldBe "105" // Number match
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 1"
            }

            it("numeric search without column should search in all fields (contains)") {
                val resultat = messageQueryService.cpaliste("200¤inneholder¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 3
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[0].herID shouldBe "2000" // Begins with 200
                resultat.partnerCpaListe[1].cpaID shouldBe "30303"
                resultat.partnerCpaListe[1].partnerID shouldBe "300"
                resultat.partnerCpaListe[1].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[1].orgNummer shouldBe "100200300" // contains 200
                resultat.partnerCpaListe[2].cpaID shouldBe "20202"
                resultat.partnerCpaListe[2].partnerID shouldBe "200" // exact match
                resultat.partnerCpaListe[2].partnerName shouldBe "Partner 2"
            }

            it("text search without column should search in all fields except partner_id (exact)") {
                val resultat = messageQueryService.cpaliste("Finn meg¤er lik¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "40404"
                resultat.partnerCpaListe[1].cpaID shouldBe "30303"
                resultat.partnerCpaListe[0].partnerID shouldBe "404"
                resultat.partnerCpaListe[1].partnerID shouldBe "300"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[1].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[0].partnerSubjectDN shouldBe "Finn meg"
                resultat.partnerCpaListe[1].partnerSubjectDN shouldBe "partner subject"
            }

            it("text search without column should search in all fields except partner_id (contains)") {
                val resultat = messageQueryService.cpaliste("epost¤inneholder¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "20202"
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[0].partnerID shouldBe "200"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 1"
                resultat.partnerCpaListe[0].partnerEndpoint shouldBe "din@epost.no"
                resultat.partnerCpaListe[1].partnerEndpoint shouldBe "min@epost.no"
            }

            it("text search with 'er lik' should return CPAs with exact match (case ignored)") {
                val resultat = messageQueryService.cpaliste("DotCom¤er lik¤KomSystem")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 1
                resultat.partnerCpaListe[0].cpaID shouldBe "30303"
                resultat.partnerCpaListe[0].partnerID shouldBe "300"
                resultat.partnerCpaListe[0].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[0].komSystem shouldBe "DotCom"
            }

            it("text search with 'starter med' should return CPAs matching starts with (case ignored)") {
                val resultat = messageQueryService.cpaliste("Partner¤starter med¤PARTNER_NAME")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 4
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[1].partnerID shouldBe "404"
                resultat.partnerCpaListe[2].partnerID shouldBe "200"
                resultat.partnerCpaListe[3].partnerID shouldBe "105"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[2].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[3].partnerName shouldBe "Partner 1"
            }

            it("text search with 'inneholder' should return CPAs containing search text (case ignored)") {
                val resultat = messageQueryService.cpaliste("SYS¤inneholder¤KomSystem")
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "40404"
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[0].partnerID shouldBe "404"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
                resultat.partnerCpaListe[0].komSystem shouldBe "aiTiSystems"
                resultat.partnerCpaListe[1].komSystem shouldBe "SysCom"
            }

            it("text search with column partner_id should not fail, and return empty list") {
                val resultat = messageQueryService.cpaliste("tekst¤er lik¤PARTNER_ID")
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 0
            }

            it("numeric search with column partner_id and 'inneholder' should return CPAs containing that number in partner_id") {
                val resultat = messageQueryService.cpaliste("5¤inneholder¤PARTNER_ID")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
            }

            it("numeric search with column partner_id and 'starter med' should return CPAs beginning with that number in partner_id") {
                val resultat = messageQueryService.cpaliste("5¤starter med¤PARTNER_ID")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe.size shouldBe 1
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
            }

            it("text search with invalid column should not fail, and return result list with no filters applied") {
                val resultat = messageQueryService.cpaliste("tekst¤er lik¤InvalidColumn")
                resultat.totalNumberOfEntries shouldBe 5
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 5
            }
        }

        describe("partnerliste") {

            it("should retrieve all partners ordered by cpa_id descending") {
                val resultat = messageQueryService.partnerliste("")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 6
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[1].cpaID shouldBe "40404"
                resultat.partnerCpaListe[1].partnerID shouldBe "404"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[2].cpaID shouldBe "30303"
                resultat.partnerCpaListe[2].partnerID shouldBe "300"
                resultat.partnerCpaListe[2].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[3].cpaID shouldBe "20202"
                resultat.partnerCpaListe[3].partnerID shouldBe "200"
                resultat.partnerCpaListe[3].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[4].cpaID shouldBe "10101"
                resultat.partnerCpaListe[4].partnerID shouldBe "105"
                resultat.partnerCpaListe[4].partnerName shouldBe "Partner 1"
                resultat.partnerCpaListe[5].cpaID shouldBe null
                resultat.partnerCpaListe[5].partnerID shouldBe "600"
                resultat.partnerCpaListe[5].partnerName shouldBe "Partner uten CPA"
            }

            it("numeric search without column should search in all fields (exact)") {
                val resultat = messageQueryService.partnerliste("105¤er lik¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[0].orgNummer shouldBe "105" // Text match
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[1].partnerID shouldBe "105" // Number match
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 1"
            }

            it("numeric search without column should search in all fields (contains)") {
                val resultat = messageQueryService.partnerliste("200¤inneholder¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 3
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[0].herID shouldBe "2000" // Begins with 200
                resultat.partnerCpaListe[1].cpaID shouldBe "30303"
                resultat.partnerCpaListe[1].partnerID shouldBe "300"
                resultat.partnerCpaListe[1].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[1].orgNummer shouldBe "100200300" // contains 200
                resultat.partnerCpaListe[2].cpaID shouldBe "20202"
                resultat.partnerCpaListe[2].partnerID shouldBe "200" // exact match
                resultat.partnerCpaListe[2].partnerName shouldBe "Partner 2"
            }

            it("text search without column should search in all fields except partner_id (exact)") {
                val resultat = messageQueryService.partnerliste("Finn meg¤er lik¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "40404"
                resultat.partnerCpaListe[1].cpaID shouldBe "30303"
                resultat.partnerCpaListe[0].partnerID shouldBe "404"
                resultat.partnerCpaListe[1].partnerID shouldBe "300"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[1].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[0].partnerSubjectDN shouldBe "Finn meg"
                resultat.partnerCpaListe[1].partnerSubjectDN shouldBe "partner subject"
            }

            it("text search without column should search in all fields except partner_id (contains)") {
                val resultat = messageQueryService.partnerliste("epost¤inneholder¤")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].cpaID shouldBe "20202"
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[0].partnerID shouldBe "200"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 1"
                resultat.partnerCpaListe[0].partnerEndpoint shouldBe "din@epost.no"
                resultat.partnerCpaListe[1].partnerEndpoint shouldBe "min@epost.no"
            }

            it("text search with 'er lik' should return CPAs with exact match (case ignored)") {
                val resultat = messageQueryService.partnerliste("DotCom¤er lik¤KomSystem")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 1
                resultat.partnerCpaListe[0].cpaID shouldBe "30303"
                resultat.partnerCpaListe[0].partnerID shouldBe "300"
                resultat.partnerCpaListe[0].partnerName shouldBe "Finn meg"
                resultat.partnerCpaListe[0].komSystem shouldBe "DotCom"
            }

            it("text search with 'starter med' should return CPAs matching starts with (case ignored)") {
                val resultat = messageQueryService.partnerliste("Partner¤starter med¤PARTNER_NAME")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 5
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[1].partnerID shouldBe "404"
                resultat.partnerCpaListe[2].partnerID shouldBe "200"
                resultat.partnerCpaListe[3].partnerID shouldBe "105"
                resultat.partnerCpaListe[4].partnerID shouldBe "600"
                resultat.partnerCpaListe[0].partnerName shouldBe "Partner 5"
                resultat.partnerCpaListe[1].partnerName shouldBe "Partner 4"
                resultat.partnerCpaListe[2].partnerName shouldBe "Partner 2"
                resultat.partnerCpaListe[3].partnerName shouldBe "Partner 1"
                resultat.partnerCpaListe[4].partnerName shouldBe "Partner uten CPA"
                resultat.partnerCpaListe[0].cpaID shouldBe "5678"
                resultat.partnerCpaListe[1].cpaID shouldBe "40404"
                resultat.partnerCpaListe[2].cpaID shouldBe "20202"
                resultat.partnerCpaListe[3].cpaID shouldBe "10101"
                resultat.partnerCpaListe[4].cpaID shouldBe null
            }

            it("text search with 'inneholder' should return CPAs containing search text (case ignored)") {
                val resultat = messageQueryService.partnerliste("sys¤inneholder¤KomSystem")
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 3
                resultat.partnerCpaListe[0].partnerID shouldBe "404"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
                resultat.partnerCpaListe[2].partnerID shouldBe "600"
                resultat.partnerCpaListe[0].cpaID shouldBe "40404"
                resultat.partnerCpaListe[1].cpaID shouldBe "10101"
                resultat.partnerCpaListe[2].cpaID shouldBe null
                resultat.partnerCpaListe[0].komSystem shouldBe "aiTiSystems"
                resultat.partnerCpaListe[1].komSystem shouldBe "SysCom"
                resultat.partnerCpaListe[2].komSystem shouldBe "SysCom"
            }

            it("text search with column partner_id should not fail, and return empty list") {
                val resultat = messageQueryService.partnerliste("tekst¤er lik¤PARTNER_ID")
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 0
            }

            it("numeric search with column partner_id and 'inneholder' should return CPAs containing that number in partner_id") {
                val resultat = messageQueryService.partnerliste("5¤inneholder¤PARTNER_ID")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 2
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
                resultat.partnerCpaListe[1].partnerID shouldBe "105"
            }

            it("numeric search with column partner_id and 'starter med' should return CPAs beginning with that number in partner_id") {
                val resultat = messageQueryService.partnerliste("5¤starter med¤PARTNER_ID")
                resultat.partnerCpaListe shouldNotBe null
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe.size shouldBe 1
                resultat.partnerCpaListe[0].partnerID shouldBe "500"
            }

            it("text search with invalid column should not fail, and return result list with no filters applied") {
                val resultat = messageQueryService.partnerliste("tekst¤er lik¤InvalidColumn")
                resultat.totalNumberOfEntries shouldBe 6
                resultat.partnerCpaListe shouldNotBe null
                resultat.partnerCpaListe.size shouldBe 6
            }
        }
    })

private fun TestDatabase.insertTestdata() {
    this.runSql(
        "INSERT INTO KOMMUNIKASJONSSYSTEM(KOMMUNIKASJONSSYSTEM_ID, BESKRIVELSE) values " +
            "(1, 'SysCom'), " +
            "(2, 'ComSky'), " +
            "(3, 'DotCom'), " +
            "(4, 'aiTiSystems');",
    )
    this.runSql(
        "INSERT INTO PARTNER(PARTNER_ID, NAVN, HER_ID, ORGNUMMER, KOMMUNIKASJONSSYSTEM_ID) values " +
            "(105, 'Partner 1', '1234', '123123123', 1), " +
            "(200, 'Partner 2', '1234', '111222333', 2), " +
            "(300, 'Finn meg', '5678', '100200300', 3), " +
            "(404, 'Partner 4', '1010', '123456789', 4), " +
            "(500, 'Partner 5', '2000', '105', 2), " +
            "(600, 'Partner uten CPA', '6000', '101202303', 1);",
    )
    this.runSql(
        "INSERT INTO PARTNER_CPA(CPA_ID, PARTNER_ID, NAV_CPP_ID, PARTNER_CPP_ID, PARTNER_SUBJECTDN, PARTNER_ENDPOINT, LASTUSED) values " +
            "(10101, '105', 'nav:cpp:051', 'partner:cpp:051', 'Dette er en partner', 'min@epost.no', '2026-07-01 12:00:00'), " +
            "(20202, '200', 'nav:cpp:052', 'partner:cpp:052', 'Dette er subject', 'din@epost.no', '2026-07-02 12:00:00'), " +
            "(30303, '300', 'nav:cpp:053', 'partner:cpp:053', 'partner subject', 'min@bedrift.no', '2026-07-03 12:00:00'), " +
            "(40404, '404', 'nav:cpp:054', 'partner:cpp:054', 'Finn meg', 'noreply@bedrift.no', '2026-07-04 12:00:00'), " +
            "(5678, '500', 'nav:cpp:055', 'partner:cpp:055', 'Siste linje', 'en@mail.net', '2026-07-05 12:00:00');",
    )
}
