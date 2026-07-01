package no.nav.emottak.aksessering.db

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import no.nav.emottak.TestDatabase
import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.BehandlerInfo
import no.nav.emottak.services.MessageQueryService
import org.slf4j.Logger

class AbonnementListeQueriesTest :
    DescribeSpec({

        describe("checkForDuplicates tests") {
            lateinit var logger: Logger
            val slot = slot<String>()

            beforeEach {
                clearAllMocks()
                logger = mockk<Logger>()
            }

            it("should find no duplicates") {
                every { logger.info(capture(slot)) } answers { }
                checkForDuplicates(createAbonnementList(0), logger)
                verify { logger.info(match { it.contains("Ingen duplikate helsepersonell funnet (totalt 7 behandlere).") }) }
            }

            it("should find one duplicate group with to identical identities") {
                every { logger.warn(capture(slot)) } answers { }
                checkForDuplicates(createAbonnementList(1), logger)
                verify {
                    logger.warn(
                        match {
                            it.contains(
                                "Duplikat helsepersonell funnet (2 ganger): GivenName='Abbas', FamilyName='Abbasi', HPR='011', HerId='678'",
                            )
                        },
                    )
                }
            }

            it("should find two duplicate groups, one group with 3 duplicates and one group with 2 duplicates") {
                every { logger.warn(capture(slot)) } answers { }
                checkForDuplicates(createAbonnementList(2), logger)
                verify {
                    logger.warn(
                        match {
                            it.contains(
                                "Duplikat helsepersonell funnet (3 ganger): GivenName='Abbas', FamilyName='Abbasi', HPR='011', HerId='678'",
                            )
                        },
                    )
                }
                verify {
                    logger.warn(
                        match {
                            it.contains(
                                "Duplikat helsepersonell funnet (2 ganger): GivenName='Tor', FamilyName='Grøndahl', HPR='191411842', HerId='2159325'",
                            )
                        },
                    )
                }
            }
        }

        describe("afterSQLFiltering tests") {

            it("should not filter if there's no filter applied") {
                val originalList = createAbonnementList(0)
                val resultList = originalList.afterSQLFiltering(ColumnSearch.createInstance("Ola¤er lik¤"))
                resultList shouldBe originalList
            }

            it("should not filter if applied filter is a SQL-filter") {
                val originalList = createAbonnementList(0)
                val resultList =
                    originalList.afterSQLFiltering(
                        ColumnSearch.createInstance("Ola¤er lik¤PARTNER_NAVN"),
                    )
                resultList shouldBe originalList
            }

            it("should filter on both BehandlerInfo-names (equals)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("Ola¤er lik¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Ola"
            }

            it("should filter on both BehandlerInfo-names (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("Tor¤inneholder¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 3
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Tor"
                resultList[1].behandlerInfo shouldNotBe null
                resultList[1].behandlerInfo!!.fornavn shouldBe "Ola"
                resultList[1].behandlerInfo!!.etternavn shouldBe "Don Toresen"
                resultList[2].behandlerInfo shouldNotBe null
                resultList[2].behandlerInfo!!.fornavn shouldBe "Kari"
                resultList[2].behandlerInfo!!.etternavn shouldBe "Toresen"
            }

            it("should filter on both BehandlerInfo-names (begins with)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("Tor¤starter med¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Tor"
                resultList[1].behandlerInfo shouldNotBe null
                resultList[1].behandlerInfo!!.fornavn shouldBe "Kari"
                resultList[1].behandlerInfo!!.etternavn shouldBe "Toresen"
            }

            it("should filter on BehandlerInfo-HPR (equals)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("011¤er lik¤BEHANDLER_HPR"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Abbas"
                resultList[0].behandlerInfo!!.hpr shouldBe "011"
            }

            it("should filter on BehandlerInfo-HPR (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("11¤inneholder¤BEHANDLER_HPR"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Abbas"
                resultList[0].behandlerInfo!!.hpr shouldBe "011"
                resultList[1].behandlerInfo shouldNotBe null
                resultList[1].behandlerInfo!!.fornavn shouldBe "Tor"
                resultList[1].behandlerInfo!!.hpr shouldBe "191411842"
            }

            it("should filter on BehandlerInfo-HPR (begins with)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("9¤starter med¤BEHANDLER_HPR"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Ola"
                resultList[0].behandlerInfo!!.hpr shouldBe "98765"
                resultList[1].behandlerInfo shouldNotBe null
                resultList[1].behandlerInfo!!.fornavn shouldBe "Kari"
                resultList[1].behandlerInfo!!.hpr shouldBe "98766"
            }

            it("should filter on BehandlerInfo-HerId (equals)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("678¤er lik¤BEHANDLER_HERID"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Abbas"
            }

            it("should filter on BehandlerInfo-HerId (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("44¤inneholder¤BEHANDLER_HERID"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Kari"
                resultList[0].behandlerInfo!!.etternavn shouldBe "Toresen"
                resultList[0].behandlerInfo!!.herId shouldBe "12344"
            }

            it("should filter BehandlerInfo - with duplikates") {
                val resultList =
                    createAbonnementList(2).afterSQLFiltering(
                        ColumnSearch.createInstance("Tor¤inneholder¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 4
                resultList[0].behandlerInfo shouldNotBe null
                resultList[0].behandlerInfo!!.fornavn shouldBe "Tor"
                resultList[1].behandlerInfo shouldNotBe null
                resultList[1].behandlerInfo!!.fornavn shouldBe "Ola"
                resultList[1].behandlerInfo!!.etternavn shouldBe "Don Toresen"
                resultList[2].behandlerInfo shouldNotBe null
                resultList[2].behandlerInfo!!.fornavn shouldBe "Kari"
                resultList[2].behandlerInfo!!.etternavn shouldBe "Toresen"
                resultList[3].behandlerInfo shouldNotBe null
                resultList[3].behandlerInfo!!.fornavn shouldBe "Tor"
            }
        }

        describe("Database query tests") {
            lateinit var testDatabase: TestDatabase
            lateinit var messageQueryService: MessageQueryService

            beforeContainer {
                testDatabase = TestDatabase()
                testDatabase.runSqlScript("/hendelse_melding_ddl.sql")
                messageQueryService = MessageQueryService(testDatabase, testDatabase.prefix)
                testDatabase.insertTestdata()
            }

            describe("HentAbonnementListe") {

                it("should retrieve all abonnements") {
                    val resultat = messageQueryService.abonnementListe("")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 5
                    resultat.abonnementListe[0].partnerId shouldBe "105"
                    resultat.abonnementListe[1].partnerId shouldBe "200"
                    resultat.abonnementListe[2].partnerId shouldBe "300"
                    resultat.abonnementListe[3].partnerId shouldBe "401"
                    resultat.abonnementListe[4].partnerId shouldBe "401"
                    resultat.abonnementListe[0].partnerNavn shouldBe "Partner 1"
                    resultat.abonnementListe[1].partnerNavn shouldBe "Partner 2"
                    resultat.abonnementListe[2].partnerNavn shouldBe "Partner 3"
                    resultat.abonnementListe[3].partnerNavn shouldBe "Partner 4"
                    resultat.abonnementListe[4].partnerNavn shouldBe "Partner 4"
                    resultat.abonnementListe[0].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[0].behandlerInfo!!.fornavn shouldBe "Ola"
                    resultat.abonnementListe[1].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[1].behandlerInfo!!.fornavn shouldBe "Åse"
                    resultat.abonnementListe[2].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[2].behandlerInfo!!.fornavn shouldBe ""
                    resultat.abonnementListe[3].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[3].behandlerInfo!!.fornavn shouldBe "Ærling"
                    resultat.abonnementListe[4].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[4].behandlerInfo!!.fornavn shouldBe "Ærling"
                }

                it("should retrieve abonnements where partnerId equals 105") {
                    val resultat = messageQueryService.abonnementListe("105¤er lik¤PARTNER_ID")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 1
                    resultat.abonnementListe[0].partnerId shouldBe "105"
                    resultat.abonnementListe[0].partnerNavn shouldBe "Partner 1"
                    resultat.abonnementListe[0].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[0].behandlerInfo!!.fornavn shouldBe "Ola"
                }

                it("should retrieve abonnements where partnerId contains 00") {
                    val resultat = messageQueryService.abonnementListe("00¤inneholder¤PARTNER_ID")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 2
                    resultat.abonnementListe[0].partnerId shouldBe "200"
                    resultat.abonnementListe[1].partnerId shouldBe "300"
                    resultat.abonnementListe[0].partnerNavn shouldBe "Partner 2"
                    resultat.abonnementListe[1].partnerNavn shouldBe "Partner 3"
                    resultat.abonnementListe[0].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[0].behandlerInfo!!.fornavn shouldBe "Åse"
                    resultat.abonnementListe[1].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[1].behandlerInfo!!.fornavn shouldBe ""
                }

                it("should retrieve abonnements here partnerNavn begins with 'Partner'") {
                    val resultat = messageQueryService.abonnementListe("Partner¤starter med¤PARTNER_NAVN")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 5
                    resultat.abonnementListe[0].partnerId shouldBe "105"
                    resultat.abonnementListe[1].partnerId shouldBe "200"
                    resultat.abonnementListe[2].partnerId shouldBe "300"
                    resultat.abonnementListe[3].partnerId shouldBe "401"
                    resultat.abonnementListe[4].partnerId shouldBe "401"
                    resultat.abonnementListe[0].partnerNavn shouldBe "Partner 1"
                    resultat.abonnementListe[1].partnerNavn shouldBe "Partner 2"
                    resultat.abonnementListe[2].partnerNavn shouldBe "Partner 3"
                    resultat.abonnementListe[3].partnerNavn shouldBe "Partner 4"
                    resultat.abonnementListe[4].partnerNavn shouldBe "Partner 4"
                }

                it("should not retrieve abonnements if there's no match") {
                    val resultat = messageQueryService.abonnementListe("Per¤inneholder¤")
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe shouldNotBe null
                    resultat.abonnementListe.size shouldBe 0
                }

                it("should retrieve abonnements where BehandlerInfo-names contains 'mann") {
                    val resultat = messageQueryService.abonnementListe("mann¤inneholder¤BEHANDLER_NAVN")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 2
                    resultat.abonnementListe[0].partnerId shouldBe "105"
                    resultat.abonnementListe[1].partnerId shouldBe "200"
                    resultat.abonnementListe[0].partnerNavn shouldBe "Partner 1"
                    resultat.abonnementListe[1].partnerNavn shouldBe "Partner 2"
                    resultat.abonnementListe[0].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[0].behandlerInfo!!.fornavn shouldBe "Ola"
                    resultat.abonnementListe[0].behandlerInfo!!.etternavn shouldBe "Normann"
                    resultat.abonnementListe[1].behandlerInfo shouldNotBe null
                    resultat.abonnementListe[1].behandlerInfo!!.fornavn shouldBe "Åse"
                    resultat.abonnementListe[1].behandlerInfo!!.etternavn shouldBe "Nordmann"
                }

                it("should retrieve abonnements where some database fields contains '5'") {
                    val resultat = messageQueryService.abonnementListe("5¤inneholder¤")
                    resultat.abonnementListe shouldNotBe null
                    resultat.totalNumberOfEntries shouldBe 5
                    resultat.abonnementListe.size shouldBe 1
                    resultat.abonnementListe[0].partnerId shouldBe "105"
                }
            }
        }
    })

private fun createAbonnementList(nrOfDuplicates: Int): List<Abonnement> {
    val abbas = BehandlerInfo("Abbas", "Abbasi", "011", "678")
    val parviz = BehandlerInfo("Parviz", "Parvizi", "021", "679")
    val mamma = BehandlerInfo("Mamma", "Mammai", "0521", "6781")
    val tor = BehandlerInfo("Tor", "Grøndahl", "191411842", "2159325")
    val ola = BehandlerInfo("Ola", "Don Toresen", "98765", "12345")
    val reza = BehandlerInfo("Reza", "Rezai", "0992", "32897")
    val kari = BehandlerInfo("Kari", "Toresen", "98766", "12344")
    val abonnent =
        Abonnement(
            partnerNavn = "partner_navn",
            partnerOrgnr = "partner_orgnr",
            partnerHerId = "partner_herid",
            endretDato = "endret_dato",
            sluttDato = null,
            tssId = "tssid",
            behandlerInfo = abbas,
            partnerId = "partner_id",
            abId = 123,
        )
    val abonnementsList =
        mutableListOf(
            abonnent,
            abonnent.copy(behandlerInfo = parviz),
            abonnent.copy(behandlerInfo = mamma),
            abonnent.copy(behandlerInfo = tor),
            abonnent.copy(behandlerInfo = ola),
            abonnent.copy(behandlerInfo = reza),
            abonnent.copy(behandlerInfo = kari),
        )
    if (nrOfDuplicates > 0) {
        abonnementsList.add(abonnent.copy(partnerId = "ny_partner1"))
        if (nrOfDuplicates > 1) {
            abonnementsList.add(abonnent.copy(partnerId = "ny_partner2", behandlerInfo = tor))
            abonnementsList.add(abonnent.copy(partnerId = "ny_partner3"))
        }
    }
    return abonnementsList
}

private fun TestDatabase.insertTestdata() {
    val a =
        Abonnement(
            partnerId = "105",
            partnerNavn = "Partner 1",
            partnerOrgnr = "Partner Orgnr",
            partnerHerId = "1234",
            endretDato = "2026-07-08 12:00:00",
            sluttDato = null,
            tssId = "80000000000",
            abId = 1001,
            behandlerInfo =
                BehandlerInfo(
                    fornavn = "Ola",
                    etternavn = "Normann",
                    hpr = "010101010",
                    herId = null,
                ),
        )
    val b =
        a.copy(
            partnerId = "200",
            partnerNavn = "Partner 2",
            behandlerInfo = BehandlerInfo("Ã\u0085se", "Nordmann", null, null),
        )
    val c =
        a.copy(
            partnerId = "300",
            partnerNavn = "Partner 3",
            sluttDato = "2027-08-09 23:00:00",
            behandlerInfo = null,
        )
    val d =
        a.copy(
            partnerId = "401",
            partnerNavn = "Partner 4",
            partnerHerId = "67890",
            behandlerInfo = BehandlerInfo("Ærling", "Håland", "44044", "040404040"),
        )
    val e =
        d.copy(
            behandlerInfo = d.behandlerInfo!!.copy(hpr = "44055", herId = "040405050"),
        )
    this.insertAbonnement(a, encodeDataToBase64 = false)
    this.insertAbonnement(b)
    this.insertAbonnement(c)
    this.insertAbonnement(d)
    this.insertAbonnement(e, doubleEncodeBase64 = true)
}

private fun TestDatabase.insertAbonnement(
    a: Abonnement,
    encodeDataToBase64: Boolean = true,
    doubleEncodeBase64: Boolean = false,
) {
    val partnerExists =
        connection.use {
            it.prepareStatement("SELECT * FROM PARTNER WHERE PARTNER_ID = ${a.partnerId}").use { stmt ->
                stmt.executeQuery().next()
            }
        }
    if (!partnerExists) {
        this.runSql(
            "INSERT INTO PARTNER(PARTNER_ID, NAVN, HER_ID, ORGNUMMER, KOMMUNIKASJONSSYSTEM_ID) " +
                "values(" + a.partnerId + ", '" + a.partnerNavn + "', '" + a.partnerHerId + "', '" + a.partnerOrgnr + "', 1)",
        )
    }
    val xml =
        if (a.behandlerInfo != null) {
            """<?xml version="1.0" encoding="UTF-8"?>
                <Root>
                    <HealthcareProfessional>
                        <FamilyName>${a.behandlerInfo.etternavn}</FamilyName>
                        <GivenName>${a.behandlerInfo.fornavn}</GivenName>
                        <Ident>
                            <Id>${a.behandlerInfo.herId}</Id>
                            <TypeId V="HER" DN="Identifikator fra Helsetjenesteenhetsregisteret (HER-id)" S="2.16.578.1.12.4.1.1.8116" />
                        </Ident>
                        <Ident>
                            <Id>${a.behandlerInfo.hpr}</Id>
                            <TypeId V="HPR" DN="HPR-nummer" S="2.16.578.1.12.4.1.1.8116" />
                        </Ident>
                    </HealthcareProfessional>
                </Root>
            """
        } else {
            """<?xml version="1.0" encoding="UTF-8"?>
                <Root>
                    <HealthcareProfessional/>
                </Root>
            """
        }
    val data =
        if (encodeDataToBase64) {
            var encoded = base64encodeXml(xml)
            if (doubleEncodeBase64) encoded = base64encodeXml(encoded)
            encoded
        } else {
            xml
        }
    val sql =
        "INSERT INTO ABONNEMENT " +
            "(TJENESTE_ID, \"KEY\", \"DATA\", SLUTT_DATO, SIST_ENDRET, PARTNER_ID, MOTTAK_ID, AB_ID) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    connection.use {
        it.prepareStatement(sql).use { stmt ->
            stmt.setObject(1, 3)
            stmt.setObject(2, a.tssId)
            stmt.setObject(3, data)
            stmt.setObject(4, a.sluttDato)
            stmt.setObject(5, a.endretDato)
            stmt.setObject(6, a.partnerId)
            stmt.setObject(7, 123)
            stmt.setObject(8, a.abId)
            stmt.executeUpdate()
        }
    }
}
