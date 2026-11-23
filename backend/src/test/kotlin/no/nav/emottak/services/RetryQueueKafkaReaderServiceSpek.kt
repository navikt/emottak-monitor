package no.nav.emottak.services

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.CancellationException
import no.nav.emottak.configuration.RetryConsumer
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.consumer.ConsumerRecords
import org.apache.kafka.clients.consumer.MockConsumer
import org.apache.kafka.clients.consumer.OffsetResetStrategy
import org.apache.kafka.common.PartitionInfo
import org.apache.kafka.common.TopicPartition
import org.apache.kafka.common.errors.TimeoutException
import org.apache.kafka.common.header.internals.RecordHeaders
import org.apache.kafka.common.record.TimestampType
import java.time.Duration
import java.util.Optional

class RetryQueueKafkaReaderServiceSpek :
    StringSpec({
        "returns an empty result for an empty topic and closes the consumer without committing" {
            val consumer = RetryTestConsumer(emptyList())
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages shouldBe emptyList()
            data.warning shouldBe null
            consumer.wasClosed shouldBe true
            consumer.commitCount shouldBe 0
        }

        "reads newest first and stops before the first repeated key" {
            val consumer =
                RetryTestConsumer(
                    listOf(
                        record(0, "D"),
                        record(1, "B"),
                        record(2, "C"),
                        record(3, "B"),
                        record(4, "A"),
                    ),
                )
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages.map { it.requestId } shouldBe listOf("A", "B", "C")
            data.warning shouldBe null
            consumer.wasClosed shouldBe true
            consumer.commitCount shouldBe 0
        }

        "detects a repeated key across 100-record windows" {
            val totalMessages = 200L
            val duplikateKeyAt = 50L
            val stopAt = duplikateKeyAt + 1
            val consumer =
                RetryTestConsumer(
                    // 201 meldinger:
                    (0L..totalMessages).map {
                        record(it, if (it == duplikateKeyAt) "key-$totalMessages" else "key-$it")
                    },
                )
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages.size shouldBe (totalMessages - duplikateKeyAt).toInt()
            data.retryMessages.map { it.requestId } shouldBe (totalMessages downTo stopAt).map { "key-$it" }
            consumer.seekOffsets.last() shouldBe 1L // Lest meldinger fra 100 til 1, etter å ha først lest 200 til 101.
        }

        "warns and returns only the configured maximum when an extra unique message exists" {
            val consumer = RetryTestConsumer((0L..1000L).map { record(it) })
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages.size shouldBe 1000
            data.retryMessages.first().requestId shouldBe "key-1000"
            data.retryMessages.last().requestId shouldBe "key-1"
            data.warning shouldNotBe null
            consumer.commitCount shouldBe 0
        }

        "does not warn when the number of messages exactly matches the limit" {
            val consumer = RetryTestConsumer((0L..999L).map { record(it) })
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages.size shouldBe 1000
            data.warning shouldBe null
        }

        "continues through multiple polls including empty polls before reaching the window end" {
            val consumer = RetryTestConsumer((0L..204L).map { record(it) }, pollSize = 17, emptyPolls = 2)
            val data = service(consumer).hentRetryMeldinger()
            data.retryMessages.map { it.requestId } shouldBe (204L downTo 0L).map { "key-$it" }
            data.warning shouldBe null
            consumer.seekOffsets shouldBe listOf(105L, 5L, 0L)
        }

        "handles retention and gaps in offsets" {
            val consumer =
                RetryTestConsumer(
                    listOf(
                        record(104),
                        record(202),
                        record(305),
                    ),
                    beginning = 100,
                    end = 310,
                )
            service(consumer).hentRetryMeldinger().retryMessages.map { it.requestId } shouldBe listOf("key-305", "key-202", "key-104")
            consumer.seekOffsets shouldBe listOf(210L, 110L, 100L)
        }

        "excludes records arriving beyond the captured end offset" {
            val consumer = RetryTestConsumer((0L..5L).map { record(it) }, end = 5)
            service(consumer).hentRetryMeldinger().retryMessages.map { it.requestId } shouldBe (4L downTo 0L).map { "key-$it" }
        }

        "does not warn if the record after the limit is a duplicate" {
            val consumer =
                RetryTestConsumer(
                    listOf(
                        record(0, "A"),
                        record(1, "B"),
                        record(2, "A"),
                    ),
                )
            val data = service(consumer, maxMessages = 2).hentRetryMeldinger()
            data.retryMessages.map { it.requestId } shouldBe listOf("A", "B")
            data.warning shouldBe null
        }

        "uses the latest occurrence of all headers and leaves message null" {
            val record = record(0)
            for (name in listOf("senderAddress", "retryCount", "retryReason", "retryableAfter")) {
                record.headers().add(name, "1".toByteArray())
                record.headers().add(name, "2".toByteArray())
            }
            val data = service(RetryTestConsumer(listOf(record))).hentRetryMeldinger()
            val message = data.retryMessages.single()
            message.requestId shouldBe "key-0"
            message.timestamp shouldBe "123456789"
            message.senderAddress shouldBe "2"
            message.retryCount shouldBe "2"
            message.retryReason shouldBe "2"
            message.retryableAfter shouldBe "2"
            message.message shouldBe null
        }

        "represents absent retry metadata explicitly" {
            val data = service(RetryTestConsumer(listOf(record(0)))).hentRetryMeldinger()
            val message = data.retryMessages.single()
            message.retryCount shouldBe ""
            message.senderAddress shouldBe ""
            message.retryReason shouldBe ""
            message.retryableAfter shouldBe ""
        }

        "rejects a null key" {
            val consumer = RetryTestConsumer(listOf(record(0, null)))
            shouldThrow<RetryMessageReadException> { service(consumer).hentRetryMeldinger() }
            consumer.wasClosed shouldBe true
        }

        "rejects multiple partitions rather than returning a partial result" {
            val consumer =
                RetryTestConsumer(emptyList()).apply {
                    updatePartitions(TOPIC, listOf(partitionInfo(0), partitionInfo(1)))
                }
            shouldThrow<RetryMessageReadException> { service(consumer).hentRetryMeldinger() }
            consumer.wasClosed shouldBe true
        }

        "propagates Kafka failures and closes the consumer" {
            val consumer = RetryTestConsumer(listOf(record(0))).apply { pollFailure = TimeoutException("unavailable") }
            shouldThrow<TimeoutException> { service(consumer).hentRetryMeldinger() }
            consumer.wasClosed shouldBe true
        }

        "propagates cancellation and closes the consumer" {
            val consumer = RetryTestConsumer(listOf(record(0))).apply { pollFailure = CancellationException() }
            shouldThrow<CancellationException> { service(consumer).hentRetryMeldinger() }
            consumer.wasClosed shouldBe true
        }

        "times out instead of returning partial data when polling makes no progress" {
            val consumer = RetryTestConsumer(listOf(record(0)), emptyPolls = Int.MAX_VALUE)
            val service = RetryQueueKafkaReaderService(RetryConsumer(true, TOPIC, "test", readTimeoutSeconds = 1)) { consumer }
            shouldThrow<RetryReadTimeoutException> { service.hentRetryMeldinger() }
            consumer.wasClosed shouldBe true
        }

        "does not create a consumer when disabled" {
            val service = RetryQueueKafkaReaderService(RetryConsumer(false, TOPIC, "test")) { error("Must not create a consumer") }
            shouldThrow<RetryConsumerDisabledException> { service.hentRetryMeldinger() }
        }

        "validates configuration bounds" {
            shouldThrow<IllegalArgumentException> { RetryConsumer(true, TOPIC, "test", maxMessages = 0) }
            shouldThrow<IllegalArgumentException> { RetryConsumer(true, TOPIC, "test", readTimeoutSeconds = 0) }
            shouldThrow<IllegalArgumentException> { RetryConsumer(true, TOPIC, "test", readTimeoutSeconds = 301) }
        }
    })

private const val TOPIC = "retry-test"
private val partition = TopicPartition(TOPIC, 0)

private fun service(
    consumer: RetryTestConsumer,
    maxMessages: Int = 1000,
) = RetryQueueKafkaReaderService(RetryConsumer(true, TOPIC, "test", maxMessages)) { consumer }

private fun record(
    offset: Long,
    key: String? = "key-$offset",
): ConsumerRecord<String, ByteArray> =
    ConsumerRecord(
        TOPIC,
        0,
        offset,
        123456789,
        TimestampType.CREATE_TIME,
        -1,
        -1,
        key,
        byteArrayOf(),
        RecordHeaders(),
        Optional.empty(),
    )

private fun partitionInfo(number: Int) = PartitionInfo(TOPIC, number, null, emptyArray(), emptyArray())

private class RetryTestConsumer(
    private val records: List<ConsumerRecord<String, ByteArray>>,
    beginning: Long = 0,
    private val end: Long = (records.maxOfOrNull { it.offset() } ?: -1) + 1,
    private val pollSize: Int = 100,
    private var emptyPolls: Int = 0,
) : MockConsumer<String, ByteArray>(OffsetResetStrategy.NONE) {
    val seekOffsets = mutableListOf<Long>()
    var wasClosed = false
    var commitCount = 0
    var pollFailure: RuntimeException? = null

    init {
        updatePartitions(TOPIC, listOf(partitionInfo(0)))
        updateBeginningOffsets(mapOf(partition to beginning))
        updateEndOffsets(mapOf(partition to end))
    }

    override fun seek(
        partition: TopicPartition,
        offset: Long,
    ) {
        seekOffsets.add(offset)
        super.seek(partition, offset)
    }

    override fun poll(timeout: Duration): ConsumerRecords<String, ByteArray> {
        pollFailure?.let { throw it }
        if (emptyPolls > 0) {
            emptyPolls--
            return ConsumerRecords(emptyMap())
        }
        val available = records.filter { it.offset() >= position(partition) }.take(pollSize)
        available.forEach { addRecord(it) }
        val result = super.poll(timeout)
        if (available.isEmpty()) super.seek(partition, end)
        return result
    }

    override fun commitSync() {
        commitCount++
        super.commitSync()
    }

    override fun close(timeout: Duration) {
        wasClosed = true
        super.close(timeout)
    }
}
