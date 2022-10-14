import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "no.nav.emottak"
version = "1.0.0"

val coroutinesVersion = "1.6.3"
val jacksonVersion = "2.13.3"
val kluentVersion = "1.68"
val ktorVersion = "2.0.0"
val spekVersion = "2.0.18"
val logbackVersion = "1.2.11"
val logstashEncoderVersion = "7.2"
val prometheusVersion = "0.5.0"
val micrometerRegistryPrometheusVersion = "1.9.1"
val nimbusjosejwtVersion = "9.25.6"
val spekjunitVersion = "2.0.16"
val ojdbc8Version = "19.3.0.0"
val hikariVersion = "5.0.1"
val mockkVersion = "1.12.4"
val kotlinVersion = "1.6.21"

val jvmTargetVersion = "17"

plugins {
    kotlin("jvm") version "1.7.0"
    id("org.jmailen.kotlinter") version "3.11.1"
    id("com.diffplug.spotless") version "6.7.2"
    id("com.github.johnrengelman.shadow") version "6.1.0"
    id("com.github.ben-manes.versions") version "0.42.0"
}

repositories {
    mavenCentral()
    maven(url = "https://dl.bintray.com/spekframework/spek-dev")
    maven(url = "https://repo1.maven.org/maven2/")
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:$coroutinesVersion")
    implementation("io.micrometer:micrometer-registry-prometheus:$micrometerRegistryPrometheusVersion")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-serialization-jackson:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-server-auth-jwt:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-client-json:$ktorVersion")
    implementation("io.ktor:ktor-client-apache:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")

    implementation("com.fasterxml.jackson.module:jackson-module-jaxb-annotations:$jacksonVersion")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$jacksonVersion")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-xml:$jacksonVersion")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:$jacksonVersion")

    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("net.logstash.logback:logstash-logback-encoder:$logstashEncoderVersion")

    implementation("com.zaxxer:HikariCP:$hikariVersion")
    implementation("com.oracle.ojdbc:ojdbc8:$ojdbc8Version")

    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("org.amshove.kluent:kluent:$kluentVersion")
    testImplementation("io.mockk:mockk:$mockkVersion")
    testImplementation("org.amshove.kluent:kluent:$kluentVersion")
    testImplementation("org.spekframework.spek2:spek-dsl-jvm:$spekVersion") {
        exclude(group = "org.jetbrains.kotlin")
    }
    testRuntimeOnly("org.spekframework.spek2:spek-runner-junit5:$spekVersion") {
        exclude(group = "org.jetbrains.kotlin")
    }
    testImplementation("com.nimbusds:nimbus-jose-jwt:$nimbusjosejwtVersion")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion") {
        exclude(group = "org.eclipse.jetty")
    }
}


tasks {
    withType<Jar> {
        manifest.attributes["Main-Class"] = "no.nav.emottak.BootstrapKt"
    }

    create("printVersion") {

        doLast {
            println(project.version)
        }
    }
    withType<KotlinCompile> {
        kotlinOptions.jvmTarget = jvmTargetVersion
    }

    named<KotlinCompile>("compileTestKotlin") {
        kotlinOptions.jvmTarget = jvmTargetVersion
    }

    withType<Wrapper> {
        gradleVersion = "7.4.2"
    }

    withType<Test> {
        useJUnitPlatform {
            includeEngines("spek2")
        }
        testLogging {
            showStandardStreams = true
        }
    }

    "check" {
        dependsOn("formatKotlin")
    }
}
