const { Op } = require("sequelize")
const { TripLink, Trip, Route, Line, Vehicle, StopRequest, Stop } = require("../models")
const HttpError = require("../utils/HttpError")

// Textos que ve el pasajero. Ninguno afirma que el vehículo se detuvo o que el pasajero bajó (ACC-07, VIA-03).
const labels = {
    direction: {
        outbound: "Ida",
        inbound: "Regreso"
    },
    linkEndReason: {
        unlinked: "Te desvinculaste del vehículo",
        trip_ended: "El viaje del vehículo finalizó"
    },
    requestStatus: {
        sent: "Enviada",
        next: "Próxima",
        closed: "Cerrada"
    },
    requestCloseReason: {
        stop_passed: "El vehículo superó el paradero solicitado",
        trip_ended: "El viaje del vehículo finalizó",
        cancelled: "Cancelaste la solicitud",
        unlinked: "Te desvinculaste antes de llegar al paradero"
    }
}

const HISTORY_NOTICE = "El paradero solicitado indica dónde pediste bajar. VoyBus no puede confirmar que hayas descendido allí."

const label = (group, value) => (value ? labels[group][value] ?? null : null)

// Fechas "YYYY-MM-DD" en hora local: "from" desde el inicio del día y "to" hasta el final del día.
const startOfDay = (date) => new Date(`${date}T00:00:00`)

const startOfNextDay = (date) => {
    const day = startOfDay(date)
    day.setDate(day.getDate() + 1)
    return day
}

const tripInclude = (lineId, extraIncludes = []) => ({
    model: Trip,
    as: "trip",
    required: true,
    include: [
        {
            model: Route,
            as: "route",
            required: true,
            where: lineId ? { lineId } : undefined,
            include: [{ model: Line, as: "line", required: true }]
        },
        ...extraIncludes
    ]
})

class HistoryService {
    // Solo vinculaciones terminadas: la vinculación en curso se consulta en el seguimiento del viaje (VIA-03).
    // No se filtra por estado de línea, recorrido o paradero, así que los desactivados siguen apareciendo.
    async listHistory(userId, { from, to, lineId, page, limit }) {
        const where = {
            userId,
            endedAt: { [Op.ne]: null }
        }

        if (from || to) {
            where.linkedAt = {}
            if (from) where.linkedAt[Op.gte] = startOfDay(from)
            if (to) where.linkedAt[Op.lt] = startOfNextDay(to)
        }

        const { rows, count } = await TripLink.findAndCountAll({
            where,
            include: [tripInclude(lineId)],
            order: [["linkedAt", "DESC"], ["id", "DESC"]],
            limit,
            offset: (page - 1) * limit
        })

        const latestRequests = await this.findLatestRequests(rows.map((link) => link.id))

        return {
            items: rows.map((link) => this.formatSummary(link, latestRequests.get(link.id))),
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            },
            notice: HISTORY_NOTICE
        }
    }

    // Un registro de otra cuenta responde igual que uno inexistente, para no revelar que existe.
    async getHistoryEntry(userId, linkId) {
        const link = await TripLink.findOne({
            where: {
                id: linkId,
                userId,
                endedAt: { [Op.ne]: null }
            },
            include: [
                tripInclude(null, [{ model: Vehicle, as: "vehicle" }]),
                { model: StopRequest, as: "stopRequests", include: [{ model: Stop, as: "stop" }] }
            ],
            order: [
                [{ model: StopRequest, as: "stopRequests" }, "requestedAt", "ASC"],
                [{ model: StopRequest, as: "stopRequests" }, "id", "ASC"]
            ]
        })

        if (!link) {
            throw new HttpError(404, "No encontramos ese registro en tu historial.")
        }

        const requests = link.stopRequests
        const latestRequest = requests[requests.length - 1]
        const { trip } = link

        return {
            ...this.formatSummary(link, latestRequest),
            method: link.method,
            trip: {
                id: trip.id,
                startedAt: trip.startedAt,
                endedAt: trip.endedAt
            },
            vehicle: {
                code: trip.vehicle.code,
                plate: trip.vehicle.plate
            },
            requests: requests.map((request) => ({
                ...this.formatRequest(request),
                stop: this.formatStop(request.stop)
            })),
            notice: HISTORY_NOTICE
        }
    }

    // Trae en una sola consulta la última solicitud de cada vinculación de la página.
    async findLatestRequests(linkIds) {
        const latest = new Map()

        if (!linkIds.length) return latest

        const requests = await StopRequest.findAll({
            where: { tripLinkId: linkIds },
            include: [{ model: Stop, as: "stop" }],
            order: [["requestedAt", "DESC"], ["id", "DESC"]]
        })

        for (const request of requests) {
            if (!latest.has(request.tripLinkId)) {
                latest.set(request.tripLinkId, request)
            }
        }

        return latest
    }

    formatSummary(link, latestRequest) {
        const { route } = link.trip
        const { line } = route

        return {
            id: link.id,
            linkedAt: link.linkedAt,
            endedAt: link.endedAt,
            endReason: link.endReason,
            endReasonLabel: label("linkEndReason", link.endReason),
            line: {
                id: line.id,
                code: line.code,
                name: line.name,
                color: line.color,
                status: line.status
            },
            route: {
                id: route.id,
                name: route.name,
                direction: route.direction,
                directionLabel: label("direction", route.direction)
            },
            requestedStop: latestRequest ? this.formatStop(latestRequest.stop) : null,
            request: latestRequest ? this.formatRequest(latestRequest) : null
        }
    }

    formatRequest(request) {
        return {
            id: request.id,
            status: request.status,
            statusLabel: label("requestStatus", request.status),
            closeReason: request.closeReason,
            closeReasonLabel: label("requestCloseReason", request.closeReason),
            requestedAt: request.requestedAt,
            closedAt: request.closedAt
        }
    }

    formatStop(stop) {
        return {
            id: stop.id,
            code: stop.code,
            name: stop.name,
            status: stop.status
        }
    }
}

module.exports = new HistoryService()
