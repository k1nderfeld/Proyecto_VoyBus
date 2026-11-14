const Line = require("../models/line")
const Stop = require("../models/stop")

// Catálogo inicial de la red (RED-01: al menos 3 líneas, RED-02: al menos 10 paraderos).
// Coordenadas de referencia en Antofagasta.
const lines = [
    { code: "101", name: "Centro - Universidad", color: "#1E88E5", status: "active" },
    { code: "102", name: "Costanera - La Portada", color: "#43A047", status: "active" },
    { code: "103", name: "Norte - Terminal", color: "#E53935", status: "suspended" }
]

const stops = [
    { code: "PA001", name: "Plaza Colón", latitude: -23.6466, longitude: -70.3980 },
    { code: "PA002", name: "Mercado Central", latitude: -23.6493, longitude: -70.3962 },
    { code: "PA003", name: "Terminal Rodoviario", latitude: -23.6334, longitude: -70.3921 },
    { code: "PA004", name: "Hospital Regional", latitude: -23.6577, longitude: -70.3955 },
    { code: "PA005", name: "Universidad Católica del Norte", latitude: -23.6797, longitude: -70.4100 },
    { code: "PA006", name: "Balneario Municipal", latitude: -23.6640, longitude: -70.4060 },
    { code: "PA007", name: "Parque Brasil", latitude: -23.6590, longitude: -70.4020 },
    { code: "PA008", name: "Mall Plaza", latitude: -23.6300, longitude: -70.3955 },
    { code: "PA009", name: "Avenida Argentina", latitude: -23.6420, longitude: -70.3890 },
    { code: "PA010", name: "La Portada", latitude: -23.5000, longitude: -70.4250 }
]

const seedNetwork = async () => {
    for (const line of lines) {
        await Line.findOrCreate({ where: { code: line.code }, defaults: line })
    }

    for (const stop of stops) {
        await Stop.findOrCreate({ where: { code: stop.code }, defaults: stop })
    }

    console.log(`Red: ${lines.length} líneas y ${stops.length} paraderos verificados.`)
}

module.exports = seedNetwork
