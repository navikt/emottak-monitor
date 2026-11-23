package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable

@Serializable
data class FindByUuidRequestDto(
    val ids: List<String>,
)
