const logger = require("morgan")
const prometheus = require("prom-client")
const request = require("request-promise")

exports.isAlive = () => {
    return (req, res) => {
        res.status(200).end()
    }
}

exports.metrics = () => {
    return (req, res) => {
        res.set('Content-Type', prometheus.register.contentType)
        console.log("Starter logging ...")
        res.end(prometheus.register.metrics())
    }
}