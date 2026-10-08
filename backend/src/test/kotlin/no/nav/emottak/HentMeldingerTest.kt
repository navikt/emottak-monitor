package no.nav.emottak

import io.kotest.assertions.withClue
import io.kotest.matchers.shouldBe
import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.model.Pageable
import no.nav.emottak.model.convertStatus
import no.nav.emottak.services.MessageQueryService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class HentMeldingerTest {
    private lateinit var testDatabase: TestDatabase
    private lateinit var messageQueryService: MessageQueryService

    @BeforeEach
    fun setup() {
        testDatabase = TestDatabase()
        testDatabase.runSqlScript("/hendelse_melding_ddl.sql")
        messageQueryService = MessageQueryService(testDatabase, testDatabase.prefix)
    }

    @AfterEach
    fun tearDown() {
        testDatabase.connection.rollback()
        testDatabase.runSql("delete from LOGG")
        testDatabase.runSql("delete from MELDING")
        testDatabase.runSql("delete from STATUS")
    }

    @Test
    fun testHentMeldinger() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertStatus()
        insertMelding(1111, "mId1", insideRequestedInterval + ".001", "1")
        insertMelding(2222, "mId2", insideRequestedInterval + ".002", "2")
        insertMelding(3333, "mId3", insideRequestedInterval + ".003", "1")
        insertMelding(4444, "mId4", insideRequestedInterval + ".004", "2")
        insertMelding(5555, "mId5", insideRequestedInterval + ".005")
        insertMelding(6666, "mId6", insideRequestedInterval + ".006")
        insertMelding(7777, "mId7", insideRequestedInterval + ".007")
        insertMelding(8888, "mId8", insideRequestedInterval + ".008")
        insertMelding(9999, "mId9", insideRequestedInterval + ".009")
        insertMelding(1000, "mId10", outsideRequestedInterval)

        // Default for Pageable is ascending
        var requestedPage = Pageable(pageNumber = 1, pageSize = 4)
        var resultPage = messageQueryService.meldinger(fom, tom, pageable = requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 6 // PageSize (4) is number of distinct conversationId's, content.size is number of actual messages
        resultPage.totalPages shouldBe 2
        resultPage.totalElements shouldBe 7 // Total number of distinct conversationId's.

        resultPage.content[0].mottakid shouldBe "mId1"
        resultPage.content[1].mottakid shouldBe "mId3"
        resultPage.content[2].mottakid shouldBe "mId2"
        resultPage.content[3].mottakid shouldBe "mId4"
        resultPage.content[4].mottakid shouldBe "mId5"
        resultPage.content[5].mottakid shouldBe "mId6"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentMeldinger("PUBLIC", fom, tom, pageable = requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 3
        resultPage.totalPages shouldBe 2
        resultPage.totalElements shouldBe 7
        resultPage.content[0].mottakid shouldBe "mId7"
        resultPage.content[1].mottakid shouldBe "mId8"
        resultPage.content[2].mottakid shouldBe "mId9"
    }

    @Test
    fun testHentMeldingerConversationId() {
        val fom = LocalDateTime.parse("1970-01-01T00:00:00")
        val tom = LocalDateTime.parse("2100-01-01T00:00:00")
        val time = "2025-09-17T12:00:00"

        insertStatus()
        insertMelding(1111, "mId1", time + ".001", "01")
        insertMelding(2222, "mId2", time + ".002", "02")
        insertMelding(3333, "mId3", time + ".003", "01")
        insertMelding(4444, "mId4", time + ".004", "02")
        insertMelding(5555, "mId5", time + ".005", "03")

        val requestedPage = Pageable(1, 4)
        val resultPage = messageQueryService.meldinger(fom, tom, conversationId = "01", pageable = requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 2
        resultPage.totalPages shouldBe 1
        resultPage.totalElements shouldBe 1
    }

    @Test
    fun testHentMeldingerConversationIdNoMatch() {
        val fom = LocalDateTime.parse("1970-01-01T00:00:00")
        val tom = LocalDateTime.parse("2100-01-01T00:00:00")
        val time = "2025-09-17T12:00:00"

        insertStatus()
        insertMelding(1111, "mId1", time + ".001", "01")
        insertMelding(2222, "mId2", time + ".002", "02")
        insertMelding(3333, "mId3", time + ".003", "01")
        insertMelding(4444, "mId4", time + ".004", "02")
        insertMelding(5555, "mId5", time + ".005", "03")

        val requestedPage = Pageable(1, 4)
        val resultPage = messageQueryService.meldinger(fom, tom, conversationId = "1", pageable = requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 0
        resultPage.totalPages shouldBe 0
        resultPage.totalElements shouldBe 0
    }

    @Test
    fun testHentMeldingerDescending() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertStatus()
        insertMelding(1111, "mId1", insideRequestedInterval + ".001")
        insertMelding(2222, "mId2", insideRequestedInterval + ".002")
        insertMelding(3333, "mId3", insideRequestedInterval + ".003")
        insertMelding(4444, "mId4", insideRequestedInterval + ".004")
        insertMelding(5555, "mId5", insideRequestedInterval + ".005")
        insertMelding(6666, "mId6", insideRequestedInterval + ".006")
        insertMelding(7777, "mId7", insideRequestedInterval + ".007")
        insertMelding(8888, "mId8", insideRequestedInterval + ".008")
        insertMelding(9999, "mId9", insideRequestedInterval + ".009")
        insertMelding(1000, "mId10", outsideRequestedInterval)

        var requestedPage = Pageable(1, 4, "DESC")
        var resultPage = messageQueryService.meldinger(fom, tom, pageable = requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId9"
        resultPage.content[1].mottakid shouldBe "mId8"
        resultPage.content[2].mottakid shouldBe "mId7"
        resultPage.content[3].mottakid shouldBe "mId6"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentMeldinger("PUBLIC", fom, tom, pageable = requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId5"
        resultPage.content[1].mottakid shouldBe "mId4"
        resultPage.content[2].mottakid shouldBe "mId3"
        resultPage.content[3].mottakid shouldBe "mId2"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentMeldinger("PUBLIC", fom, tom, pageable = requestedPage)
        resultPage.page shouldBe 3
        resultPage.content.size shouldBe 1
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId1"
    }

    @Test
    fun testHentMeldingerStatusFilter() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val time = "2025-09-17T12:00:00"

        val statusTexts =
            listOf(
                Pair("0", "Meldingen er opprettet"),
                Pair("10", "Meldingen er under behandling"),
                Pair("15", "Sendt til manuell behandling"),
                Pair("20", "Advarsel"),
                Pair("30", "Meldingen feilet under behandling"),
                Pair("40", "Fatal feil oppstod under behandling"),
                Pair("50", "Meldingen er ferdigbehandlet"),
            )
        statusTexts.forEachIndexed { i, (statusLevel, text) ->
            val index = i + 1
            testDatabase.runSql("insert into STATUS(STATUSLEVEL, STATUSTEXT) values($statusLevel,'$text')")
            insertMelding(index, "mId$index", "$time.00$index", statusLevel = statusLevel.toInt())
        }
        insertMelding(8, "related8", "$time.008", conversationId = "convers_mId1", statusLevel = 10)
        insertMelding(9, "related9", "$time.009", conversationId = "convers_mId2", statusLevel = 10)
        insertMelding(10, "related10", "$time.010", conversationId = "convers_mId3", statusLevel = 10)
        insertMelding(11, "unik11", "$time.011", conversationId = "unik_id", statusLevel = 10)
        insertMelding(12, "relatedOutside12", "2025-09-16T11:00:00", conversationId = "convers_mId6", statusLevel = 10)
        insertMelding(13, "outside", "2025-09-16T12:00:00", statusLevel = 50)

        val requestedPage = Pageable(pageNumber = 1, pageSize = 2)
        val allMessages = messageQueryService.meldinger(fom, tom, pageable = requestedPage)
        withClue("All messages") {
            allMessages.totalElements shouldBe 8 // Antall unike conversationId'er
        }

        val firstPage = messageQueryService.meldinger(fom, tom, status = "10", pageable = requestedPage)
        withClue("First page with status 10 (processing)") {
            firstPage.totalElements shouldBe 4
            firstPage.totalPages shouldBe 2
            firstPage.page shouldBe 1
            firstPage.content.size shouldBe 4 // Returnerer også relaterte meldinger (created-meldingen)
            firstPage.content.map { it.mottakid } shouldBe listOf("mId1", "related8", "mId2", "related9")
            firstPage.content.map { it.status } shouldBe listOf("created", "info", "info", "info")
        }

        val secondPage = messageQueryService.meldinger(fom, tom, status = "10", pageable = requestedPage.next())
        withClue("Second page with status 10 (processing)") {
            secondPage.totalElements shouldBe 4
            secondPage.totalPages shouldBe 2
            secondPage.page shouldBe 2
            secondPage.content.size shouldBe 3
            secondPage.content.map { it.mottakid } shouldBe listOf("mId3", "related10", "unik11")
            secondPage.content.map { it.status } shouldBe listOf("manual", "info", "info")
        }

        var result = messageQueryService.meldinger(fom, tom, status = "10", pageable = Pageable(1, 10))
        withClue("Test of status 10 (info)") {
            result.totalElements shouldBe 4 // Number of unique conversationIds
            result.content.count { it.status == convertStatus("10") } shouldBe 5 // Number of messages with status 10
            result.content.size shouldBe 7 // Number of all messages (status 10, and their related)
        }

        result = messageQueryService.meldinger(fom, tom, status = "30", pageable = Pageable(1, 10))
        withClue("Test of status 30 (error)") {
            result.totalElements shouldBe 1 // Number of unique conversationIds
            result.content.count { it.status == convertStatus("30") } shouldBe 1
        }

        result = messageQueryService.meldinger(fom, tom, status = "15", pageable = Pageable(1, 10))
        withClue("Test of status 15 (manual)") {
            result.totalElements shouldBe 1 // Number of unique conversationIds
            // TODO: Both the manual and the related info message (related10) should be returned
            result.content.count { it.status == convertStatus("15") } shouldBe 1 // Should be 2?
            result.content[0].mottakid shouldBe "mId3"
            // result.content[1].mottakid shouldBe "related10"
            result.content[0].conversationId shouldBe "convers_mId3"
            // result.content[1].conversationId shouldBe "convers_mId3"
        }

        result = messageQueryService.meldinger(fom, tom, status = "50", pageable = Pageable(1, 10))
        withClue("Test of status 50 (ok)") {
            result.totalElements shouldBe 1 // Number of unique conversationIds
            result.content.count { it.status == convertStatus("50") } shouldBe 1
        }

        val combinedFilters =
            messageQueryService.meldinger(
                fom,
                tom,
                role = "role_mId2",
                service = "service_mId2",
                action = "action_mId2",
                status = "10",
                pageable = requestedPage,
            )
        combinedFilters.totalElements shouldBe 1
        combinedFilters.content.map { it.mottakid } shouldBe listOf("mId2", "related9")

        withClue("Test of blank status") {
            result = messageQueryService.meldinger(fom, tom, status = "", pageable = Pageable(1, 20))
            result.totalElements shouldBe 8 // Unique conversationIds
            result.content.size shouldBe 12 // Unique messages
        }
    }

    // TODO: Lag test som tester søk/filter på spesialtegn (kolon, krøllalfa, osv)

    @Test
    fun testHentMeldingerUnpaged() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertStatus()
        insertMelding(1111, "mId1", insideRequestedInterval + ".001")
        insertMelding(2222, "mId2", insideRequestedInterval + ".002")
        insertMelding(3333, "mId3", insideRequestedInterval + ".003")
        insertMelding(4444, "mId4", insideRequestedInterval + ".004")
        insertMelding(5555, "mId5", insideRequestedInterval + ".005")
        insertMelding(6666, "mId6", insideRequestedInterval + ".006")
        insertMelding(7777, "mId7", insideRequestedInterval + ".007")
        insertMelding(8888, "mId8", insideRequestedInterval + ".008")
        insertMelding(9999, "mId9", insideRequestedInterval + ".009")
        insertMelding(1000, "mId10", outsideRequestedInterval)

        // Default for unpaged is descending
        val resultPage = messageQueryService.meldinger(fom, tom)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 9
        resultPage.totalPages shouldBe 1
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId9"
        resultPage.content[1].mottakid shouldBe "mId8"
        resultPage.content[2].mottakid shouldBe "mId7"
        resultPage.content[3].mottakid shouldBe "mId6"
        resultPage.content[4].mottakid shouldBe "mId5"
        resultPage.content[5].mottakid shouldBe "mId4"
        resultPage.content[6].mottakid shouldBe "mId3"
        resultPage.content[7].mottakid shouldBe "mId2"
        resultPage.content[8].mottakid shouldBe "mId1"
    }

    fun insertMelding(
        hendelseid: Int,
        mottakid: String,
        tid: String,
        conversationId: String? = null,
        statusLevel: Int = 1,
    ) {
        testDatabase.runSql(
            "insert into LOGG(HENDELSE_ID, MOTTAK_ID) " +
                "values(" + hendelseid + ",'" + mottakid + "')",
        )
        val conversId = conversationId ?: "convers_$mottakid"
        testDatabase.runSql(
            "insert into MELDING(MOTTAK_ID, DATOMOTTAT, ROLE, SERVICE, ACTION, REFERANSEPARAM, EBCOMNAVN, " +
                "EBCONVERS_ID, AVTALE_ID, STATUSLEVEL) " +
                "values('$mottakid','$tid','role_$mottakid','service_$mottakid','action_$mottakid'," +
                "'param_$mottakid','sender_$mottakid','$conversId','cpa_$mottakid',$statusLevel)",
        )
    }

    fun insertStatus() {
        testDatabase.runSql(
            "insert into STATUS(STATUSLEVEL, STATUSTEXT) " +
                "values(1,'The best status ever')",
        )
    }
}
