package no.nav.emottak.model

const val ASCENDING = "ASC"
const val DESCENDING = "DESC"

class Pageable( // Based on Spring Data Pageable
    val pageNumber: Int,
    val pageSize: Int,
    val sort: String = ASCENDING,
) {
    val offset = (pageNumber - 1) * pageSize.toLong()

    fun next() = Pageable(pageNumber + 1, pageSize, sort)
}
