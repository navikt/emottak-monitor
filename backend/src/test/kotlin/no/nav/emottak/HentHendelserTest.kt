package no.nav.emottak

import io.kotest.matchers.shouldBe
import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.model.Pageable
import no.nav.emottak.services.MessageQueryService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class HentHendelserTest {
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
        testDatabase.connection.rollback() // seems not to work always, so need to delete test data explicitly... ?
        testDatabase.runSql("delete from LOGG")
        testDatabase.runSql("delete from MELDING")
        testDatabase.runSql("delete from HENDELSE")
    }

    @Test
    fun testHentHendelser() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertHendelse(1111, "mId1", insideRequestedInterval + ".001")
        insertHendelse(2222, "mId2", insideRequestedInterval + ".002")
        insertHendelse(3333, "mId3", insideRequestedInterval + ".003")
        insertHendelse(4444, "mId4", insideRequestedInterval + ".004")
        insertHendelse(5555, "mId5", insideRequestedInterval + ".005")
        insertHendelse(6666, "mId6", insideRequestedInterval + ".006")
        insertHendelse(7777, "mId7", insideRequestedInterval + ".007")
        insertHendelse(8888, "mId8", insideRequestedInterval + ".008")
        insertHendelse(9999, "mId9", insideRequestedInterval + ".009")
        insertHendelse(1000, "mId10", outsideRequestedInterval)

        // Default for Pageable is ascending
        var requestedPage = Pageable(1, 4)
        var resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId1"
        resultPage.content[1].mottakid shouldBe "mId2"
        resultPage.content[2].mottakid shouldBe "mId3"
        resultPage.content[3].mottakid shouldBe "mId4"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId5"
        resultPage.content[1].mottakid shouldBe "mId6"
        resultPage.content[2].mottakid shouldBe "mId7"
        resultPage.content[3].mottakid shouldBe "mId8"

        requestedPage = requestedPage.next()
        resultPage = messageQueryService.hendelser(fom, tom, requestedPage)
        resultPage.page shouldBe 3
        resultPage.content.size shouldBe 1
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId9"
    }

    @Test
    fun testHentHendelserDescending() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertHendelse(1111, "mId1", insideRequestedInterval + ".001")
        insertHendelse(2222, "mId2", insideRequestedInterval + ".002")
        insertHendelse(3333, "mId3", insideRequestedInterval + ".003")
        insertHendelse(4444, "mId4", insideRequestedInterval + ".004")
        insertHendelse(5555, "mId5", insideRequestedInterval + ".005")
        insertHendelse(6666, "mId6", insideRequestedInterval + ".006")
        insertHendelse(7777, "mId7", insideRequestedInterval + ".007")
        insertHendelse(8888, "mId8", insideRequestedInterval + ".008")
        insertHendelse(9999, "mId9", insideRequestedInterval + ".009")
        insertHendelse(1000, "mId10", outsideRequestedInterval)

        var requestedPage = Pageable(1, 4, "DESC")
        var resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId9"
        resultPage.content[1].mottakid shouldBe "mId8"
        resultPage.content[2].mottakid shouldBe "mId7"
        resultPage.content[3].mottakid shouldBe "mId6"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId5"
        resultPage.content[1].mottakid shouldBe "mId4"
        resultPage.content[2].mottakid shouldBe "mId3"
        resultPage.content[3].mottakid shouldBe "mId2"

        requestedPage = requestedPage.next()
        resultPage = messageQueryService.hendelser(fom, tom, requestedPage)
        resultPage.page shouldBe 3
        resultPage.content.size shouldBe 1
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBe "mId1"
    }

    @Test
    fun testHentHendelserUnpaged() {
        val fom = LocalDateTime.parse("2025-09-17T00:00:00")
        val tom = LocalDateTime.parse("2025-09-18T00:00:00")
        val insideRequestedInterval = "2025-09-17T12:00:00"
        val outsideRequestedInterval = "2025-09-16T12:00:00"

        insertHendelse(1111, "mId1", insideRequestedInterval + ".001")
        insertHendelse(2222, "mId2", insideRequestedInterval + ".002")
        insertHendelse(3333, "mId3", insideRequestedInterval + ".003")
        insertHendelse(4444, "mId4", insideRequestedInterval + ".004")
        insertHendelse(5555, "mId5", insideRequestedInterval + ".005")
        insertHendelse(6666, "mId6", insideRequestedInterval + ".006")
        insertHendelse(7777, "mId7", insideRequestedInterval + ".007")
        insertHendelse(8888, "mId8", insideRequestedInterval + ".008")
        insertHendelse(9999, "mId9", insideRequestedInterval + ".009")
        insertHendelse(1000, "mId10", outsideRequestedInterval)

        // Default for unpaged is descending
        val resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom)
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

    fun insertHendelse(
        hendelseid: Int,
        mottakid: String,
        tid: String,
    ) {
        testDatabase.runSql(
            "insert into LOGG(HENDELSE_ID, MOTTAK_ID, HENDELSEDATO, TILLEGSINFO) " +
                "values(" + hendelseid + ",'" + mottakid + "','" + tid + "','info_for_" + hendelseid + "')",
        )
        testDatabase.runSql(
            "insert into HENDELSE(HENDELSE_ID, HENDELSEDESKR) " +
                "values(" + hendelseid + ",'deskr_for_" + hendelseid + "')",
        )
        testDatabase.runSql(
            "insert into MELDING(MOTTAK_ID, ROLE, SERVICE, ACTION, REFERANSEPARAM, EBCOMNAVN) " +
                "values('" + mottakid + "','role_" + mottakid + "','service_" + mottakid + "','action_" + mottakid +
                "','param_" + mottakid + "','sender_" + mottakid + "')",
        )
    }
}
