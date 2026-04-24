package no.nav.emottak.application.api

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.junit.jupiter.api.Test
import java.time.Month

class ToLocalDateTimeTest {
    @Test
    fun shouldParseStringToLocalDate() {
        val dateString = "2026-04-03"
        val localDateTime = dateString.toLocalDate(dateString)
        localDateTime shouldNotBe null
        localDateTime!!.dayOfMonth shouldBe 3
        localDateTime.month shouldBe Month.APRIL
        localDateTime.year shouldBe 2026
    }
}
