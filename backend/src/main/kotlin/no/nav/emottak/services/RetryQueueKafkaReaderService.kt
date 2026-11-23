package no.nav.emottak.services

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import no.nav.emottak.configuration.RetryConsumer
import no.nav.emottak.configuration.toProperties
import no.nav.emottak.model.RetryMessage
import no.nav.emottak.model.RetryMessageData
import no.nav.emottak.utils.config.Kafka
import org.apache.kafka.clients.consumer.Consumer
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.TopicPartition
import org.apache.kafka.common.serialization.ByteArrayDeserializer
import org.apache.kafka.common.serialization.StringDeserializer
import java.time.Duration

private const val BATCH_SIZE = 100

class RetryQueueKafkaReaderService(
    private val consumerSettings: RetryConsumer,
    private val consumerFactory: () -> Consumer<String, ByteArray>,
) {
    constructor(consumerSettings: RetryConsumer, kafkaSettings: Kafka) : this(
        consumerSettings,
        {
            KafkaConsumer(
                kafkaSettings.toProperties().apply {
                    put(ConsumerConfig.GROUP_ID_CONFIG, consumerSettings.consumerGroupId)
                    put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false")
                    put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "none")
                    put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, BATCH_SIZE.toString())
                    put(ConsumerConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, (consumerSettings.readTimeoutSeconds * 1000).toString())
                },
                StringDeserializer(),
                ByteArrayDeserializer(),
            )
        },
    )

    suspend fun hentRetryMeldinger(): RetryMessageData =
        withContext(Dispatchers.IO) {
            if (!consumerSettings.active) throw RetryConsumerDisabledException()
            val context = currentCoroutineContext()
            val deadline = System.nanoTime() + Duration.ofSeconds(consumerSettings.readTimeoutSeconds).toNanos()

            fun remaining(): Duration {
                context.ensureActive()
                val nanos = deadline - System.nanoTime()
                if (nanos <= 0) throw RetryReadTimeoutException()
                return Duration.ofNanos(nanos)
            }

            val consumer = consumerFactory()
            try {
                val partitions = consumer.partitionsFor(consumerSettings.retryTopic, remaining())
                if (partitions.size != 1) {
                    throw RetryMessageReadException("Retry topic must have exactly one partition")
                }
                val partition = TopicPartition(consumerSettings.retryTopic, partitions.single().partition())
                consumer.assign(listOf(partition))
                val beginning = consumer.beginningOffsets(listOf(partition), remaining()).getValue(partition)
                // Freeze the upper bound so arrivals during this request are excluded.
                var end = consumer.endOffsets(listOf(partition), remaining()).getValue(partition)
                val messages = mutableListOf<RetryMessage>()
                val keys = mutableSetOf<String>()
                while (end > beginning) {
                    val start = maxOf(beginning, end - BATCH_SIZE)
                    consumer.seek(partition, start)
                    val batch = mutableListOf<ConsumerRecord<String, ByteArray>>()
                    while (consumer.position(partition, remaining()) < end) {
                        val records = consumer.poll(minOf(remaining(), Duration.ofSeconds(1)))
                        batch.addAll(records.records(partition).filter { it.offset() in start until end })
                    }
                    for (record in batch.asReversed()) {
                        val key = record.key() ?: throw RetryMessageReadException("Retry record has no key")
                        if (!keys.add(key)) return@withContext RetryMessageData(messages)
                        if (messages.size == consumerSettings.maxMessages) {
                            return@withContext RetryMessageData(
                                messages,
                                "Viser bare de ${consumerSettings.maxMessages} nyeste meldingene. Det finnes flere meldinger.",
                            )
                        }
                        messages.add(record.toRetryMessage(key))
                    }
                    end = start
                }
                RetryMessageData(messages)
            } finally {
                consumer.close(Duration.ofSeconds(1))
            }
        }
}

private fun ConsumerRecord<String, ByteArray>.toRetryMessage(key: String) =
    RetryMessage(
        requestId = key,
        timestamp = timestamp().toString(),
        senderAddress = lastHeaderValue("senderAddress").orEmpty(),
        retryCount = lastHeaderValue("retryCount").orEmpty(),
        retryReason = lastHeaderValue("retryReason").orEmpty(),
        retryableAfter = lastHeaderValue("retryableAfter").orEmpty(),
    )

private fun ConsumerRecord<String, ByteArray>.lastHeaderValue(name: String): String? =
    headers().lastHeader(name)?.value()?.toString(Charsets.UTF_8)

class RetryConsumerDisabledException : IllegalStateException("Retry consumer is disabled")

class RetryReadTimeoutException : RuntimeException("Retry read timed out")

class RetryMessageReadException(
    message: String,
) : RuntimeException(message)
