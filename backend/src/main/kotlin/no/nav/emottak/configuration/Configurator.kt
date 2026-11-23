package no.nav.emottak.configuration

import com.sksamuel.hoplite.ConfigLoader
import com.sksamuel.hoplite.addEnvironmentSource
import com.sksamuel.hoplite.addResourceSource

val config by lazy {
    config()
}

fun config() =
    ConfigLoader
        .builder()
        .addEnvironmentSource()
        .addResourceSource("/kafka_common.conf")
        .addResourceSource("/application.conf")
        .withExplicitSealedTypes()
        .build()
        .loadConfigOrThrow<Config>()
