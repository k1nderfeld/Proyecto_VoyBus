const historyService = require("../services/history.services")
const respondWithError = require("../utils/respondWithError")

const DEFAULT_LIMIT = 10

const listHistory = async (req, res) => {
    try {
        const { from, to, lineId, page, limit } = req.query
        const history = await historyService.listHistory(req.auth.userId, {
            from,
            to,
            lineId: lineId ? Number(lineId) : null,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : DEFAULT_LIMIT
        })

        return res.json({
            success: true,
            message: "Historial obtenido correctamente.",
            data: history
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo obtener el historial.")
    }
}

const getHistoryEntry = async (req, res) => {
    try {
        const entry = await historyService.getHistoryEntry(req.auth.userId, Number(req.params.id))

        return res.json({
            success: true,
            message: "Detalle del historial obtenido correctamente.",
            data: entry
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo obtener el detalle del historial.")
    }
}

module.exports = {
    listHistory,
    getHistoryEntry
}
