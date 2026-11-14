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
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo completar el registro."
        })
    }
}

module.exports = { register }
