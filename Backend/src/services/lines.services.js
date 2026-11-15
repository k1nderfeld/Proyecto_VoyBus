const { Op } = require("sequelize")
const { Line, Route, RouteStop, RouteSchedule, Stop } = require("../models")
const HttpError = require("../utils/HttpError")
const { directionLabels, lineStatusLabels, lineStatusNotices, formatDays } = require("../config/network")
const { normalizeSearchText, searchTextContains } = require("../utils/search")
const { paginationOffset, buildPagination } = require("../utils/pagination")

// Las líneas desactivadas no se muestran; las suspendidas sí, con su aviso (RED-01).
const visibleLineWhere = { status: { [Op.ne]: "inactive" } }

// La ida se muestra antes que el regreso.
const byDirection = (a, b) =>
    Route.DIRECTIONS.indexOf(a.direction) - Route.DIRECTIONS.indexOf(b.direction) || a.id - b.id

class LinesService {
    async listLines({ search, page, limit }) {
        const term = normalizeSearchText(search)
        const where = { ...visibleLineWhere }

        if (term) {
            where[Op.and] = [searchTextContains("searchText", term)]
        }

        const { rows, count } = await Line.findAndCountAll({
            where,
            order: [["code", "ASC"], ["id", "ASC"]],
            limit,
            offset: paginationOffset({ page, limit })
        })

        const routesByLine = await this.findActiveRoutes(rows.map((line) => line.id))
        const endpoints = await this.findRouteEndpoints(
            [...routesByLine.values()].flat().map((route) => route.id)
        )

        return {
            items: rows.map((line) => {
                const [mainRoute] = routesByLine.get(line.id) || []

                return {
                    ...this.formatLine(line),
                    ...this.endpointsOf(mainRoute, endpoints)
                }
            }),
            pagination: buildPagination({ page, limit }, count),
            search: term || null
        }
    }

    async getLine(lineId) {
        const line = await this.findVisibleLine(lineId)
        const routes = await Route.findAll({
            where: { lineId: line.id, status: "active" },
            include: [{ model: RouteSchedule, as: "schedules" }]
        })

        routes.sort(byDirection)

        const endpoints = await this.findRouteEndpoints(routes.map((route) => route.id))

        return {
            ...this.formatLine(line),
            ...this.endpointsOf(routes[0], endpoints),
            routes: routes.map((route) => ({
                ...this.formatRoute(route),
                ...this.endpointsOf(route, endpoints),
                schedules: this.formatSchedules(route.schedules)
            }))
        }
    }

    // Detalle de un recorrido: paraderos en orden y trazado para el mapa.
    async getLineRoute(lineId, routeId) {
        const line = await this.findVisibleLine(lineId)
        const route = await Route.findOne({
            where: { id: routeId, lineId: line.id, status: "active" },
            include: [{ model: RouteSchedule, as: "schedules" }]
        })

        if (!route) {
            throw new HttpError(404, "No encontramos ese recorrido para la línea seleccionada.")
        }

        const stops = await this.findActiveRouteStops([route.id])
        const routeStops = stops.map((routeStop) => routeStop.stop)

        return {
            line: this.formatLine(line),
            route: {
                ...this.formatRoute(route),
                origin: routeStops.length ? this.formatEndpoint(routeStops[0]) : null,
                destination: routeStops.length ? this.formatEndpoint(routeStops[routeStops.length - 1]) : null,
                schedules: this.formatSchedules(route.schedules)
            },
            stops: routeStops.map((stop, index) => ({
                order: index + 1,
                id: stop.id,
                code: stop.code,
                name: stop.name,
                latitude: stop.latitude,
                longitude: stop.longitude
            })),
            // El recorrido se define por sus paraderos en orden (ADM-01); la app une estos puntos en el mapa.
            path: routeStops.map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude }))
        }
    }

    async findVisibleLine(lineId) {
        const line = await Line.findOne({ where: { id: lineId, ...visibleLineWhere } })

        if (!line) {
            throw new HttpError(404, "No encontramos esa línea o ya no está disponible.")
        }

        return line
    }

    async findActiveRoutes(lineIds) {
        const routesByLine = new Map()

        if (!lineIds.length) return routesByLine

        const routes = await Route.findAll({ where: { lineId: lineIds, status: "active" } })

        for (const route of routes.sort(byDirection)) {
            if (!routesByLine.has(route.lineId)) routesByLine.set(route.lineId, [])
            routesByLine.get(route.lineId).push(route)
        }

        return routesByLine
    }

    // Paraderos activos de los recorridos, en orden. Los desactivados no se muestran.
    async findActiveRouteStops(routeIds) {
        if (!routeIds.length) return []

        return RouteStop.findAll({
            where: { routeId: routeIds },
            include: [{ model: Stop, as: "stop", required: true, where: { status: "active" } }],
            order: [["routeId", "ASC"], ["position", "ASC"]]
        })
    }

    // Inicio y término de cada recorrido: su primer y último paradero activo.
    async findRouteEndpoints(routeIds) {
        const endpoints = new Map()

        for (const routeStop of await this.findActiveRouteStops(routeIds)) {
            const current = endpoints.get(routeStop.routeId)

            endpoints.set(routeStop.routeId, {
                origin: current ? current.origin : routeStop.stop,
                destination: routeStop.stop
            })
        }

        return endpoints
    }

    endpointsOf(route, endpoints) {
        const routeEndpoints = route && endpoints.get(route.id)

        return {
            origin: routeEndpoints ? this.formatEndpoint(routeEndpoints.origin) : null,
            destination: routeEndpoints ? this.formatEndpoint(routeEndpoints.destination) : null
        }
    }

    formatLine(line) {
        return {
            id: line.id,
            code: line.code,
            name: line.name,
            color: line.color,
            status: line.status,
            statusLabel: lineStatusLabels[line.status],
            notice: lineStatusNotices[line.status] ?? null
        }
    }

    formatRoute(route) {
        return {
            id: route.id,
            name: route.name,
            direction: route.direction,
            directionLabel: directionLabels[route.direction]
        }
    }

    formatEndpoint(stop) {
        return {
            id: stop.id,
            code: stop.code,
            name: stop.name
        }
    }

    formatSchedules(schedules = []) {
        return [...schedules]
            .sort((a, b) => a.dayList[0] - b.dayList[0] || a.startTime.localeCompare(b.startTime))
            .map((schedule) => ({
                days: schedule.dayList,
                daysLabel: formatDays(schedule.dayList),
                startTime: schedule.startTime,
                endTime: schedule.endTime
            }))
    }
}

module.exports = new LinesService()
