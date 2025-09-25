package no.nav.emottak

import no.nav.emottak.aksessering.db.hentHendelser
import no.nav.emottak.model.Pageable
import no.nav.emottak.services.MessageQueryService
import org.amshove.kluent.shouldBe
import org.amshove.kluent.shouldBeEqualTo
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
        testDatabase.connection.rollback()
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

        // NOTE: currently we query with DESC ordering on hendelsedato, so we expect the latest hendelse to be first in the resultset
        var requestedPage = Pageable(1, 4)
        var resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBeEqualTo "mId9"
        resultPage.content[1].mottakid shouldBeEqualTo "mId8"
        resultPage.content[2].mottakid shouldBeEqualTo "mId7"
        resultPage.content[3].mottakid shouldBeEqualTo "mId6"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentHendelser("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBeEqualTo "mId5"
        resultPage.content[1].mottakid shouldBeEqualTo "mId4"
        resultPage.content[2].mottakid shouldBeEqualTo "mId3"
        resultPage.content[3].mottakid shouldBeEqualTo "mId2"

        requestedPage = requestedPage.next()
        resultPage = messageQueryService.hendelser(fom, tom, requestedPage)
        resultPage.page shouldBe 3
        resultPage.content.size shouldBe 1
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakid shouldBeEqualTo "mId1"
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
