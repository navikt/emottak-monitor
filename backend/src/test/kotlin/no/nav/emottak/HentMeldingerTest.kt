package no.nav.emottak

import no.nav.emottak.aksessering.db.hentMeldinger
import no.nav.emottak.model.Pageable
import no.nav.emottak.services.MessageQueryService
import org.amshove.kluent.shouldBe
import org.amshove.kluent.shouldBeEqualTo
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
    }

    @Test
    fun testHentMeldinger() {
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

        // NOTE: currently we query with DESC ordering on datomottat, so we expect the latest melding to be first in the resultset
        var requestedPage = Pageable(1, 4)
        var resultPage = messageQueryService.meldinger(fom, tom, requestedPage)
        println("Result: " + resultPage)
        resultPage.page shouldBe 1
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakidliste shouldBeEqualTo "mId9"
        resultPage.content[1].mottakidliste shouldBeEqualTo "mId8"
        resultPage.content[2].mottakidliste shouldBeEqualTo "mId7"
        resultPage.content[3].mottakidliste shouldBeEqualTo "mId6"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentMeldinger("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 2
        resultPage.content.size shouldBe 4
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakidliste shouldBeEqualTo "mId5"
        resultPage.content[1].mottakidliste shouldBeEqualTo "mId4"
        resultPage.content[2].mottakidliste shouldBeEqualTo "mId3"
        resultPage.content[3].mottakidliste shouldBeEqualTo "mId2"

        requestedPage = requestedPage.next()
        resultPage = testDatabase.hentMeldinger("PUBLIC", fom, tom, requestedPage)
        resultPage.page shouldBe 3
        resultPage.content.size shouldBe 1
        resultPage.totalPages shouldBe 3
        resultPage.totalElements shouldBe 9
        resultPage.content[0].mottakidliste shouldBeEqualTo "mId1"
    }

    fun insertMelding(
        hendelseid: Int,
        mottakid: String,
        tid: String,
    ) {
        testDatabase.runSql(
            "insert into LOGG(HENDELSE_ID, MOTTAK_ID) " +
                "values(" + hendelseid + ",'" + mottakid + "')",
        )
        testDatabase.runSql(
            "insert into MELDING(MOTTAK_ID, DATOMOTTAT, ROLE, SERVICE, ACTION, REFERANSEPARAM, EBCOMNAVN, E" +
                "BCONVERS_ID, AVTALE_ID, STATUSLEVEL) " +
                "values('" + mottakid + "','" + tid + "','role_" + mottakid + "','service_" + mottakid + "','action_" +
                mottakid + "','param_" + mottakid + "','sender_" + mottakid + "','convers_" + mottakid +
                "','cpa_+mottakid+',1)",
        )
    }

    fun insertStatus() {
        testDatabase.runSql(
            "insert into STATUS(STATUSLEVEL, STATUSTEXT) " +
                "values(1,'The best status ever')",
        )
    }
}
