const linesService = require("../services/lines.services")
const respondWithError = require("../utils/respondWithError")
const { parsePagination } = require("../utils/pagination")

const DEFAULT_LIMIT = 20

const listLines = async (req, res) => {
    try {
        const result = await linesService.listLines({
            search: req.query.search,
            ...parsePagination(req.query, DEFAULT_LIMIT)
        })

        let message = "Líneas obtenidas correctamente."

        if (!result.pagination.total) {
            message = result.search
                ? "No encontramos líneas que coincidan con tu búsqueda."
                : "No hay líneas disponibles por ahora."
        }

        return res.json({
            success: true,
            message,
            data: result
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron cargar las líneas. Inténtalo nuevamente.")
    }
}

const getLine = async (req, res) => {
    try {
        const line = await linesService.getLine(Number(req.params.id))

        return res.json({
            success: true,
            message: "Línea obtenida correctamente.",
            data: line
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo cargar la línea. Inténtalo nuevamente.")
    }
}

const getLineRoute = async (req, res) => {
    try {
        const route = await linesService.getLineRoute(Number(req.params.id), Number(req.params.routeId))

        return res.json({
            success: true,
            message: "Recorrido obtenido correctamente.",
            data: route
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo cargar el recorrido. Inténtalo nuevamente.")
    }
}

module.exports = {
    listLines,
    getLine,
    getLineRoute
}
