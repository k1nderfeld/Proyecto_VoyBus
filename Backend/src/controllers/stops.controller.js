const stopsService = require("../services/stops.services")
const respondWithError = require("../utils/respondWithError")
const { parsePagination } = require("../utils/pagination")

const DEFAULT_LIMIT = 20

// Las coordenadas ya vienen validadas: llegan las cuatro o ninguna.
const parseBounds = ({ minLat, maxLat, minLng, maxLng }) =>
    minLat
        ? { minLat: Number(minLat), maxLat: Number(maxLat), minLng: Number(minLng), maxLng: Number(maxLng) }
        : null

const emptyMessage = (search, bounds) => {
    if (search) return "No encontramos paraderos que coincidan con tu búsqueda."
    if (bounds) return "No hay paraderos en esta zona del mapa."
    return "No hay paraderos disponibles por ahora."
}

const listStops = async (req, res) => {
    try {
        const bounds = parseBounds(req.query)
        const result = await stopsService.listStops({
            search: req.query.search,
            bounds,
            ...parsePagination(req.query, DEFAULT_LIMIT)
        })

        return res.json({
            success: true,
            message: result.pagination.total
                ? "Paraderos obtenidos correctamente."
                : emptyMessage(result.search, bounds),
            data: result
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron cargar los paraderos. Inténtalo nuevamente.")
    }
}

const getStop = async (req, res) => {
    try {
        const stop = await stopsService.getStop(Number(req.params.id), req.auth)

        return res.json({
            success: true,
            message: "Paradero obtenido correctamente.",
            data: stop
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo cargar el paradero. Inténtalo nuevamente.")
    }
}

module.exports = {
    listStops,
    getStop
}
