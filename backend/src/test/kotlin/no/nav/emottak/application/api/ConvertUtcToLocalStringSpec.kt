package no.nav.emottak.application.api

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe

class ConvertUtcToLocalStringSpec :
    StringSpec({

        "should convert to local string (summer time)" {
            val utc = "2026-06-09T08:14:27Z"
            val expected = "2026-06-09 10:14:27"
            convertUtcToLocalString(utc) shouldBe expected
        }

        "should convert to local string (winter time)" {
            val utc = "2026-01-09T08:14:27Z"
            val expected = "2026-01-09 09:14:27"
            convertUtcToLocalString(utc) shouldBe expected
        }

        "should return null when receiving null" {
            convertUtcToLocalString(null) shouldBe null
        }

        "should convert to correct local date (new year)" {
            val utc = "2025-12-31T23:30:00Z"
            val expected = "2026-01-01 00:30:00"
            convertUtcToLocalString(utc) shouldBe expected
        }

        "should return original value in case of exception" {
            val value = "2025-12-31T23:30:00+02:00[Europe/Oslo]"
            convertUtcToLocalString(value) shouldBe value
        }
    })
