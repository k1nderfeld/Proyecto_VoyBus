const { Line, Stop, Route, RouteStop, RouteSchedule } = require("../models")

// Catálogo inicial de la red (RED-01: al menos 3 líneas, RED-02: al menos 10 paraderos).
// Coordenadas de referencia en Antofagasta. La línea 104 y el paradero PA011 están desactivados:
// no deben aparecer en las consultas.
const lines = [
    { code: "101", name: "Centro - Universidad", color: "#1E88E5", status: "active" },
    { code: "102", name: "Costanera - La Portada", color: "#43A047", status: "active" },
    { code: "103", name: "Norte - Terminal", color: "#E53935", status: "suspended" },
    { code: "104", name: "Circunvalación", color: "#8E24AA", status: "inactive" }
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
    { code: "PA010", name: "La Portada", latitude: -23.5000, longitude: -70.4250 },
    // Desactivado: no debe aparecer en las consultas de paraderos.
    { code: "PA011", name: "Ex Estación Antofagasta", latitude: -23.6520, longitude: -70.3975, status: "inactive" }
]

const WEEKDAYS = "1,2,3,4,5"

// Paraderos del recorrido de ida, en orden. El regreso recorre los mismos en sentido inverso.
// Los días van de 1 (lunes) a 7 (domingo).
const routes = [
    {
        line: "101",
        outbound: "Plaza Colón - Universidad",
        inbound: "Universidad - Plaza Colón",
        stops: ["PA001", "PA002", "PA004", "PA007", "PA006", "PA005"],
        schedules: [
            { days: WEEKDAYS, startTime: "06:00", endTime: "23:00" },
            { days: "6", startTime: "07:00", endTime: "22:00" },
            { days: "7", startTime: "08:00", endTime: "21:00" }
        ]
    },
    {
        line: "102",
        outbound: "Mercado - La Portada",
        inbound: "La Portada - Mercado",
        stops: ["PA002", "PA001", "PA009", "PA003", "PA008", "PA010"],
        schedules: [
            { days: WEEKDAYS, startTime: "06:30", endTime: "22:30" },
            { days: "6,7", startTime: "08:00", endTime: "22:00" }
        ]
    },
    {
        line: "103",
        outbound: "Plaza Colón - Terminal",
        inbound: "Terminal - Plaza Colón",
        stops: ["PA001", "PA009", "PA003"],
        schedules: [
            { days: "1,2,3,4,5,6,7", startTime: "07:00", endTime: "20:00" }
        ]
    }
]

const seedRoutes = async () => {
    for (const definition of routes) {
        const line = await Line.findOne({ where: { code: definition.line } })

        for (const direction of Route.DIRECTIONS) {
            const [route] = await Route.findOrCreate({
                where: { lineId: line.id, direction },
                defaults: { name: definition[direction] }
            })

            const stopCodes = direction === "outbound" ? definition.stops : [...definition.stops].reverse()

            for (const [index, code] of stopCodes.entries()) {
                const stop = await Stop.findOne({ where: { code } })
                await RouteStop.findOrCreate({
                    where: { routeId: route.id, position: index + 1 },
                    defaults: { stopId: stop.id }
                })
            }

            for (const schedule of definition.schedules) {
                await RouteSchedule.findOrCreate({
                    where: { routeId: route.id, days: schedule.days },
                    defaults: schedule
                })
            }
        }
    }
}

const seedNetwork = async () => {
    for (const line of lines) {
        await Line.findOrCreate({ where: { code: line.code }, defaults: line })
    }

    for (const stop of stops) {
        await Stop.findOrCreate({ where: { code: stop.code }, defaults: stop })
    }

    await seedRoutes()

    console.log(
        `Red: ${lines.length} líneas, ${stops.length} paraderos y ` +
        `${routes.length * Route.DIRECTIONS.length} recorridos con horarios verificados.`
    )
}

module.exports = seedNetwork
