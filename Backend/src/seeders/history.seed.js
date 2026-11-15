const bcrypt = require("bcryptjs")
const db = require("../config/database")
const { User, Line, Stop, Route, RouteStop, Vehicle, Trip, TripLink, StopRequest } = require("../models")

// Cuentas demo (RNF-04). La contraseña se puede cambiar con SEED_DEMO_PASSWORD.
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || "Demo123!"

const demoUsers = [
    { key: "passenger", name: "Pasajero Demo", email: "pasajero@voybus.cl", role: "passenger" },
    { key: "driver", name: "Conductor Demo", email: "conductor@voybus.cl", role: "driver" }
]

// Paraderos de cada recorrido de ida, en orden. El regreso recorre los mismos en sentido inverso.
const routes = [
    { line: "101", outbound: "Plaza Colón - Universidad", inbound: "Universidad - Plaza Colón", stops: ["PA001", "PA002", "PA004", "PA007", "PA006", "PA005"] },
    { line: "102", outbound: "Mercado - La Portada", inbound: "La Portada - Mercado", stops: ["PA002", "PA001", "PA009", "PA003", "PA008", "PA010"] },
    { line: "103", outbound: "Plaza Colón - Terminal", inbound: "Terminal - Plaza Colón", stops: ["PA001", "PA009", "PA003"] }
]

const vehicles = [
    { code: "BUS001", plate: "ABCD12" },
    { code: "BUS002", plate: "EFGH34" },
    { code: "BUS003", plate: "IJKL56" }
]

// Viajes pasados del pasajero demo. "requests" se aplican en orden (la última es la vigente del registro).
const pastTrips = [
    { daysAgo: 2, hour: 8, line: "101", direction: "outbound", vehicle: "BUS001", method: "qr", endReason: "trip_ended",
        requests: [{ stop: "PA005", closeReason: "stop_passed" }] },
    { daysAgo: 5, hour: 18, line: "102", direction: "outbound", vehicle: "BUS002", method: "qr", endReason: "trip_ended",
        requests: [{ stop: "PA003", closeReason: "cancelled" }, { stop: "PA008", closeReason: "trip_ended" }] },
    { daysAgo: 9, hour: 13, line: "101", direction: "inbound", vehicle: "BUS001", method: "manual", endReason: "unlinked",
        requests: [] },
    { daysAgo: 15, hour: 7, line: "103", direction: "outbound", vehicle: "BUS003", method: "qr", endReason: "trip_ended",
        requests: [{ stop: "PA003", closeReason: "stop_passed" }] },
    { daysAgo: 20, hour: 19, line: "102", direction: "inbound", vehicle: "BUS002", method: "manual", endReason: "unlinked",
        requests: [{ stop: "PA001", closeReason: "unlinked" }] },
    { daysAgo: 30, hour: 9, line: "101", direction: "outbound", vehicle: "BUS001", method: "qr", endReason: "trip_ended",
        requests: [{ stop: "PA006", closeReason: "stop_passed" }] }
]

const at = (daysAgo, hour, minutes = 0) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(hour, minutes, 0, 0)
    return date
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000)

const seedUsers = async () => {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
    const users = {}

    for (const { key, ...data } of demoUsers) {
        const [user] = await User.findOrCreate({
            where: { email: data.email },
            defaults: { ...data, password: passwordHash, acceptedTermsAt: new Date() }
        })
        users[key] = user
    }

    return users
}

const seedRoutes = async () => {
    const routesByKey = {}

    for (const definition of routes) {
        const line = await Line.findOne({ where: { code: definition.line } })

        for (const direction of ["outbound", "inbound"]) {
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

            routesByKey[`${definition.line}-${direction}`] = route
        }
    }

    return routesByKey
}

const seedVehicles = async () => {
    const vehiclesByCode = {}

    for (const vehicle of vehicles) {
        const [record] = await Vehicle.findOrCreate({ where: { code: vehicle.code }, defaults: vehicle })
        vehiclesByCode[vehicle.code] = record
    }

    return vehiclesByCode
}

const seedPassengerTrips = async ({ passenger, driver }, routesByKey, vehiclesByCode) => {
    const stopsByCode = Object.fromEntries((await Stop.findAll()).map((stop) => [stop.code, stop]))

    await db.transaction(async (transaction) => {
        for (const definition of pastTrips) {
            const startedAt = at(definition.daysAgo, definition.hour)
            const linkedAt = addMinutes(startedAt, 5)
            const linkEndedAt = addMinutes(startedAt, 35)
            const tripEndedAt = definition.endReason === "trip_ended" ? linkEndedAt : addMinutes(startedAt, 50)

            const trip = await Trip.create({
                routeId: routesByKey[`${definition.line}-${definition.direction}`].id,
                vehicleId: vehiclesByCode[definition.vehicle].id,
                driverId: driver.id,
                status: "finished",
                startedAt,
                endedAt: tripEndedAt
            }, { transaction })

            const link = await TripLink.create({
                tripId: trip.id,
                userId: passenger.id,
                method: definition.method,
                linkedAt,
                endedAt: linkEndedAt,
                endReason: definition.endReason
            }, { transaction })

            for (const [index, request] of definition.requests.entries()) {
                const requestedAt = addMinutes(linkedAt, 3 + index * 6)
                await StopRequest.create({
                    tripLinkId: link.id,
                    stopId: stopsByCode[request.stop].id,
                    status: "closed",
                    closeReason: request.closeReason,
                    requestedAt,
                    closedAt: request.closeReason === "trip_ended" || request.closeReason === "unlinked"
                        ? linkEndedAt
                        : addMinutes(requestedAt, 5)
                }, { transaction })
            }
        }

        // Viaje en curso: no aparece en el historial porque la vinculación sigue activa.
        const currentTrip = await Trip.create({
            routeId: routesByKey["102-outbound"].id,
            vehicleId: vehiclesByCode.BUS002.id,
            driverId: driver.id,
            startedAt: addMinutes(new Date(), -20)
        }, { transaction })

        const currentLink = await TripLink.create({
            tripId: currentTrip.id,
            userId: passenger.id,
            method: "qr",
            linkedAt: addMinutes(new Date(), -10)
        }, { transaction })

        await StopRequest.create({
            tripLinkId: currentLink.id,
            stopId: stopsByCode.PA010.id,
            requestedAt: addMinutes(new Date(), -8)
        }, { transaction })
    })
}

const seedHistory = async () => {
    const users = await seedUsers()
    const routesByKey = await seedRoutes()
    const vehiclesByCode = await seedVehicles()

    // Solo se cargan viajes la primera vez, para no duplicar el historial al repetir el seed.
    const existingLinks = await TripLink.count({ where: { userId: users.passenger.id } })

    if (!existingLinks) {
        await seedPassengerTrips(users, routesByKey, vehiclesByCode)
    }

    console.log(
        `Viajes: ${routes.length * 2} recorridos, ${vehicles.length} vehículos y ` +
        `${existingLinks ? "historial demo ya existente" : `${pastTrips.length} viajes de historial creados`}.`
    )
    console.log(`Cuentas demo: ${demoUsers.map((user) => user.email).join(", ")}.`)
}

module.exports = seedHistory
