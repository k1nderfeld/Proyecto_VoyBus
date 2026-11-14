const authService = require("../services/auth.services")
const HttpError = require("../utils/HttpError")

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body)

        return res.status(201).json({
            success: true,
            message: "Cuenta creada correctamente.",
            data: user
        })
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.status).json({
                success: false,
                message: error.message,
                ...error.details
            })
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo completar el registro."
        })
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
            message: "No se pudo iniciar sesión."
        })
    }
}

module.exports = { register, login }
