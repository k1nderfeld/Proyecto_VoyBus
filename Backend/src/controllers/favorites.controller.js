const favoritesService = require("../services/favorites.services")
const respondWithError = require("../utils/respondWithError")

const listFavorites = async (req, res) => {
    try {
        const favorites = await favoritesService.listFavorites(req.auth.userId)

        return res.json({
            success: true,
            message: "Favoritos obtenidos correctamente.",
            data: favorites
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron obtener los favoritos.")
    }
}

// "type" es "lines" o "stops"; cada ruta lo fija al registrar el controlador.
const addFavorite = (type) => async (req, res) => {
    try {
        const { created, favorite } = await favoritesService.addFavorite(req.auth.userId, type, Number(req.params.id))

        return res.status(created ? 201 : 200).json({
            success: true,
            message: created ? "Agregado a tus favoritos." : "Ya estaba en tus favoritos.",
            data: favorite
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo agregar a favoritos.")
    }
}

const removeFavorite = (type) => async (req, res) => {
    try {
        await favoritesService.removeFavorite(req.auth.userId, type, Number(req.params.id))

        return res.json({
            success: true,
            message: "Quitado de tus favoritos."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo quitar de favoritos.")
    }
}

module.exports = {
    listFavorites,
    addFavorite,
    removeFavorite
}
