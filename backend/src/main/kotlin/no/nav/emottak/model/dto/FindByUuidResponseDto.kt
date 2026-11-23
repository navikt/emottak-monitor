package no.nav.emottak.model.dto

import kotlinx.serialization.Serializable
import kotlin.uuid.Uuid

@Serializable
data class FindByUuidResponseDto<T>(
    val content: Map<Uuid, T>,
    val invalidIds: List<String>,
)
