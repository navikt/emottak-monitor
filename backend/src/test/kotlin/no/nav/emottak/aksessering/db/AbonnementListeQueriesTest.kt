package no.nav.emottak.aksessering.db

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import no.nav.emottak.model.Abonnement
import no.nav.emottak.model.BehandlerInfo
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
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Ola"
            }

            it("should filter on both BehandlerInfo-names (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("Tor¤inneholder¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo.size shouldBe 2
                resultList[0].behandlerInfo[0].fornavn shouldBe "Tor"
                resultList[0].behandlerInfo[1].fornavn shouldBe "Ola"
                resultList[0].behandlerInfo[1].etternavn shouldBe "Don Toresen"
                resultList[1].behandlerInfo.size shouldBe 1
                resultList[1].behandlerInfo[0].fornavn shouldBe "Kari"
                resultList[1].behandlerInfo[0].etternavn shouldBe "Toresen"
            }

            it("should filter on both BehandlerInfo-names (begins with)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("Tor¤starter med¤BEHANDLER_NAVN"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Tor"
                resultList[1].behandlerInfo.size shouldBe 1
                resultList[1].behandlerInfo[0].fornavn shouldBe "Kari"
                resultList[1].behandlerInfo[0].etternavn shouldBe "Toresen"
            }

            it("should filter on BehandlerInfo-HPR (equals)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("011¤er lik¤BEHANDLER_HPR"),
                    )

                resultList.size shouldBe 1
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Abbas"
                resultList[0].behandlerInfo[0].hpr shouldBe "011"
            }

            it("should filter on BehandlerInfo-HPR (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("11¤inneholder¤BEHANDLER_HPR"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo.size shouldBe 2
                resultList[0].behandlerInfo[0].fornavn shouldBe "Abbas"
                resultList[0].behandlerInfo[0].hpr shouldBe "011"
                resultList[0].behandlerInfo[1].fornavn shouldBe "Tor"
                resultList[0].behandlerInfo[1].hpr shouldBe "191411842"
            }

            it("should filter on BehandlerInfo-HPR (begins with)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("9¤starter med¤BEHANDLER_HPR"),
                    )
                resultList.size shouldBe 2
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Ola"
                resultList[0].behandlerInfo[0].hpr shouldBe "98765"
                resultList[1].behandlerInfo.size shouldBe 1
                resultList[1].behandlerInfo[0].fornavn shouldBe "Kari"
                resultList[1].behandlerInfo[0].hpr shouldBe "98766"
            }

            it("should filter on BehandlerInfo-HerId (equals)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("678¤er lik¤BEHANDLER_HERID"),
                    )

                resultList.size shouldBe 1
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Abbas"
            }

            it("should filter on BehandlerInfo-HerId (contains)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("44¤inneholder¤BEHANDLER_HERID"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo.size shouldBe 1
                resultList[0].behandlerInfo[0].fornavn shouldBe "Kari"
                resultList[0].behandlerInfo[0].etternavn shouldBe "Toresen"
                resultList[0].behandlerInfo[0].herId shouldBe "12344"
            }

            it("should filter on BehandlerInfo-HerId (begins with)") {
                val resultList =
                    createAbonnementList(0).afterSQLFiltering(
                        ColumnSearch.createInstance("6¤starter med¤BEHANDLER_HERID"),
                    )
                resultList.size shouldBe 1
                resultList[0].behandlerInfo.size shouldBe 3
                resultList[0].behandlerInfo[0].fornavn shouldBe "Abbas"
                resultList[0].behandlerInfo[0].herId shouldBe "678"
                resultList[0].behandlerInfo[1].fornavn shouldBe "Parviz"
                resultList[0].behandlerInfo[1].herId shouldBe "679"
                resultList[0].behandlerInfo[2].fornavn shouldBe "Mamma"
                resultList[0].behandlerInfo[2].herId shouldBe "6781"
            }
        }
    })

private fun createAbonnementList(nrOfDuplicates: Int): List<Abonnement> {
    val resultatListe = mutableListOf<BehandlerInfo>()
    resultatListe.add(BehandlerInfo("Abbas", "Abbasi", "011", "678"))
    resultatListe.add(BehandlerInfo("Parviz", "Parvizi", "021", "679"))
    resultatListe.add(BehandlerInfo("Mamma", "Mammai", "0521", "6781"))
    if (nrOfDuplicates > 0) {
        resultatListe.add(BehandlerInfo("Abbas", "Abbasi", "011", "678"))
    }
    resultatListe.add(BehandlerInfo("Tor", "Grøndahl", "191411842", "2159325"))
    resultatListe.add(BehandlerInfo("Ola", "Don Toresen", "98765", "12345"))
    resultatListe.add(BehandlerInfo("Reza", "Rezai", "0992", "32897"))
    if (nrOfDuplicates > 1) {
        resultatListe.add(BehandlerInfo("Tor", "Grøndahl", "191411842", "2159325"))
        resultatListe.add(BehandlerInfo("Abbas", "Abbasi", "011", "678"))
    }
    val abonnementsList =
        listOf(
            Abonnement(
                partnerNavn = "partner_navn",
                partnerOrgnr = "partner_orgnr",
                partnerHerId = "partner_herid",
                endretDato = "endret_dato",
                sluttDato = null,
                tssId = "tssid",
                behandlerInfo = resultatListe,
                partnerId = "partner_id",
                abId = 123,
            ),
            Abonnement(
                partnerNavn = "partner_navn",
                partnerOrgnr = "partner_orgnr",
                partnerHerId = "partner_herid",
                endretDato = "endret_dato",
                sluttDato = null,
                tssId = "tssid",
                behandlerInfo = listOf(BehandlerInfo("Kari", "Toresen", "98766", "12344")),
                partnerId = "partner_id",
                abId = 123,
            ),
        )
    return abonnementsList
}
