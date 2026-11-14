const authService = require("../services/auth.services")
const HttpError = require("../utils/HttpError")

const respondWithError = (res, error, message) => {
    if (error instanceof HttpError) {
        if (error.details.retryAfterSeconds) {
            res.set("Retry-After", String(error.details.retryAfterSeconds))
        }

        return res.status(error.status).json({
            success: false,
            message: error.message,
            ...error.details
        })
    }

    return res.status(500).json({
        success: false,
        message
    })
}

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body)

        return res.status(201).json({
            success: true,
            message: "Cuenta creada correctamente.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo completar el registro.")
    }
}

const login = async (req, res) => {
    try {
        const session = await authService.login(req.body)

        return res.json({
            success: true,
            message: "Sesión iniciada correctamente.",
            data: session
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo iniciar sesión.")
    }
}

const logout = async (req, res) => {
    try {
        await authService.logout(req.auth.sessionId)

        return res.json({
            success: true,
            message: "Sesión cerrada correctamente."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo cerrar la sesión.")
    }
}

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email)

        return res.json({
            success: true,
            message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo procesar la solicitud.")
    }
}

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body)

        return res.json({
            success: true,
            message: "Tu contraseña fue actualizada."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo restablecer la contraseña.")
    }
}

const changePassword = async (req, res) => {
    try {
        await authService.changePassword({
            userId: req.auth.userId,
            sessionId: req.auth.sessionId,
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
        })

        return res.json({
            success: true,
            message: "Tu contraseña fue actualizada."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo actualizar la contraseña.")
    }
}

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
}
