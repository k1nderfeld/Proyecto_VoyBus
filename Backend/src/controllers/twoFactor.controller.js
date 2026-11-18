const twoFactorService = require("../services/twoFactor.services")
const respondWithError = require("../utils/respondWithError")

const setupTwoFactor = async (req, res) => {
    try {
        const setup = await twoFactorService.setup(req.auth.userId)

        return res.json({
            success: true,
            message: "Escanea el código QR con tu aplicación autenticadora y confirma el código de 6 dígitos.",
            data: setup
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo preparar la verificación en dos pasos.")
    }
}

const enableTwoFactor = async (req, res) => {
    try {
        const user = await twoFactorService.enable(req.auth.userId, req.body.code)

        return res.json({
            success: true,
            message: "Activaste la verificación en dos pasos.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo activar la verificación en dos pasos.")
    }
}

const disableTwoFactor = async (req, res) => {
    try {
        const user = await twoFactorService.disable(req.auth.userId, req.body)

        return res.json({
            success: true,
            message: "Desactivaste la verificación en dos pasos.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo desactivar la verificación en dos pasos.")
    }
}

module.exports = {
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor
}
