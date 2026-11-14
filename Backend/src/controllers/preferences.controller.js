const preferencesService = require("../services/preferences.services")
const respondWithError = require("../utils/respondWithError")

const getPreferenceOptions = (req, res) => {
    return res.json({
        success: true,
        message: "Opciones de preferencias disponibles.",
        data: preferencesService.getOptions()
    })
}

const getPreferences = async (req, res) => {
    try {
        const preferences = await preferencesService.getPreferences(req.auth.userId)

        return res.json({
            success: true,
            message: "Preferencias obtenidas correctamente.",
            data: preferences
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron obtener las preferencias.")
    }
}

const updatePreferences = async (req, res) => {
    try {
        const preferences = await preferencesService.updatePreferences(req.auth.userId, req.body)

        return res.json({
            success: true,
            message: "Preferencias actualizadas correctamente.",
            data: preferences
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron actualizar las preferencias.")
    }
}

module.exports = {
    getPreferenceOptions,
    getPreferences,
    updatePreferences
}
