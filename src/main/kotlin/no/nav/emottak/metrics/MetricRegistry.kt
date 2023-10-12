package no.nav.emottak.metrics

import io.prometheus.client.Counter

const val METRICS_EM = "emottak-monitor"
val hentmeldingerCounter: Counter =
    Counter.build().namespace(METRICS_EM).name("hentmeldinger_count")
        .help("Counts the number of api calls to hentmeldinger")
        .register()
val henthendelserCounter: Counter =
    Counter.build().namespace(METRICS_EM).name("henthendelser_count")
        .help("Counts the number of api calls to henthendelser")
        .register()