const FavoriteLine = require("../models/favoriteLine")
const FavoriteStop = require("../models/favoriteStop")
const Line = require("../models/line")
const Stop = require("../models/stop")
const HttpError = require("../utils/HttpError")

// Configuración por tipo de favorito para compartir la misma lógica entre líneas y paraderos.
const favoriteTypes = {
    lines: {
        favoriteModel: FavoriteLine,
        targetModel: Line,
        alias: "line",
        foreignKey: "lineId",
        notAvailable: "La línea no existe o no está disponible.",
        notFavorite: "La línea no está en tus favoritos.",
        format: (line) => ({
            id: line.id,
            code: line.code,
            name: line.name,
            color: line.color,
            status: line.status
        })
    },
    stops: {
        favoriteModel: FavoriteStop,
        targetModel: Stop,
        alias: "stop",
        foreignKey: "stopId",
        notAvailable: "El paradero no existe o no está disponible.",
        notFavorite: "El paradero no está en tus favoritos.",
        format: (stop) => ({
            id: stop.id,
            code: stop.code,
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude,
            status: stop.status
        })
    }
}

class FavoritesService {
    // Se incluyen líneas o paraderos desactivados (con su estado) para que el pasajero pueda quitarlos.
    async listFavorites(userId) {
        const [lines, stops] = await Promise.all(
            ["lines", "stops"].map((type) => this.listByType(userId, type))
        )

        return { lines, stops }
    }

    async addFavorite(userId, type, targetId) {
        const config = favoriteTypes[type]
        const target = await config.targetModel.findByPk(targetId)

        if (!target || target.status === "inactive") {
            throw new HttpError(404, config.notAvailable)
        }

        const [favorite, created] = await config.favoriteModel.findOrCreate({
            where: { userId, [config.foreignKey]: target.id }
        })

        return {
            created,
            favorite: { ...config.format(target), savedAt: favorite.createdAt }
        }
    }

    async removeFavorite(userId, type, targetId) {
        const config = favoriteTypes[type]
        const deleted = await config.favoriteModel.destroy({
            where: { userId, [config.foreignKey]: targetId }
        })

        if (!deleted) {
            throw new HttpError(404, config.notFavorite)
        }
    }

    async listByType(userId, type) {
        const config = favoriteTypes[type]
        const favorites = await config.favoriteModel.findAll({
            where: { userId },
            include: [{ model: config.targetModel, as: config.alias }],
            order: [["createdAt", "DESC"], ["id", "DESC"]]
        })

        return favorites.map((favorite) => ({
            ...config.format(favorite[config.alias]),
            savedAt: favorite.createdAt
        }))
    }
}

module.exports = new FavoritesService()
