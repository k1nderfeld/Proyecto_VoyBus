const { Op } = require("sequelize")
const { Stop, FavoriteStop } = require("../models")
const HttpError = require("../utils/HttpError")
const { formatLine, formatRoute } = require("../utils/networkFormat")
const { byDirection, findServingRouteStops } = require("../utils/networkQueries")
const { normalizeSearchText, searchTextContains } = require("../utils/search")
const { paginationOffset, buildPagination } = require("../utils/pagination")

const byCode = (a, b) => a.code.localeCompare(b.code) || a.id - b.id

class StopsService {
    // Búsqueda por nombre o código y/o zona visible del mapa. Los paraderos desactivados no se muestran (RED-02).
    async listStops({ search, bounds, page, limit }) {
        const term = normalizeSearchText(search)
        const where = { status: "active" }

        if (term) {
            where[Op.and] = [searchTextContains("searchText", term)]
        }

        if (bounds) {
            where.latitude = { [Op.between]: [bounds.minLat, bounds.maxLat] }
            where.longitude = { [Op.between]: [bounds.minLng, bounds.maxLng] }
        }

        const { rows, count } = await Stop.findAndCountAll({
            where,
            order: [["code", "ASC"], ["id", "ASC"]],
            limit,
            offset: paginationOffset({ page, limit })
        })

        const linesByStop = this.groupLinesByStop(await findServingRouteStops(rows.map((stop) => stop.id)))

        return {
            items: rows.map((stop) => ({
                ...this.formatStop(stop),
                // Resumen para dibujar el marcador; el detalle trae recorridos y sentidos.
                lines: (linesByStop.get(stop.id) || []).map(({ line }) => ({
                    id: line.id,
                    code: line.code,
                    color: line.color,
                    status: line.status
                }))
            })),
            pagination: buildPagination({ page, limit }, count),
            search: term || null
        }
    }

    // auth es null para invitados: entonces isFavorite también es null.
    async getStop(stopId, auth) {
        const stop = await Stop.findOne({ where: { id: stopId, status: "active" } })

        if (!stop) {
            throw new HttpError(404, "No encontramos ese paradero o ya no está disponible.")
        }

        const lines = this.groupLinesByStop(await findServingRouteStops([stop.id])).get(stop.id) || []

        return {
            ...this.formatStop(stop),
            lines: lines.map(({ line, routes }) => ({
                ...formatLine(line),
                routes: routes.map(formatRoute)
            })),
            isFavorite: await this.isFavorite(stop.id, auth)
        }
    }

    async isFavorite(stopId, auth) {
        if (!auth || auth.role !== "passenger") return null

        return (await FavoriteStop.count({ where: { userId: auth.userId, stopId } })) > 0
    }

    // stopId -> [{ line, routes }], con líneas por código y recorridos con la ida primero.
    groupLinesByStop(routeStops) {
        const grouped = new Map()

        for (const { stopId, route } of routeStops) {
            if (!grouped.has(stopId)) grouped.set(stopId, new Map())

            const lines = grouped.get(stopId)

            if (!lines.has(route.line.id)) lines.set(route.line.id, { line: route.line, routes: [] })
            lines.get(route.line.id).routes.push(route)
        }

        const result = new Map()

        for (const [stopId, lines] of grouped) {
            const sorted = [...lines.values()].sort((a, b) => byCode(a.line, b.line))
            sorted.forEach((entry) => entry.routes.sort(byDirection))
            result.set(stopId, sorted)
        }

        return result
    }

    formatStop(stop) {
        return {
            id: stop.id,
            code: stop.code,
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude
        }
    }
}

module.exports = new StopsService()
