const authService = require("../services/auth.services")
const respondWithError = require("../utils/respondWithError")

const register = async (req, res) => {
    try {
        const { user, channel, codeSent } = await authService.register(req.body)
        const destination = channel === "email" ? "a tu correo" : "por SMS a tu teléfono"

        return res.status(201).json({
            success: true,
            message: codeSent
                ? `Cuenta creada. Te enviamos un código ${destination} para verificarla.`
                : "Cuenta creada, pero no pudimos enviar el código de verificación. Pide uno nuevo.",
            data: { user, verification: { channel, codeSent } }
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

const verify = async (req, res) => {
    try {
        const session = await authService.verifyContact(req.body)

        return res.json({
            success: true,
            message: "Cuenta verificada. Ya iniciaste sesión.",
            data: session
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo verificar la cuenta.")
    }
}

const resendVerification = async (req, res) => {
    try {
        await authService.resendVerification(req.body)

        return res.json({
            success: true,
            message: "Si la cuenta está pendiente de verificación, te enviamos un nuevo código."
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo enviar el código.")
    }
}

const googleLogin = async (req, res) => {
    try {
        const session = await authService.googleLogin(req.body)

        return res.json({
            success: true,
            message: "Sesión iniciada con Google.",
            data: session
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo iniciar sesión con Google.")
    }
}

// Solo en desarrollo: cuentas demo con su contraseña, para el botón "Usar" del login de la app.
const demoAccounts = async (req, res) => {
    try {
        const accounts = await authService.listDemoAccounts()

        return res.json({
            success: true,
            message: accounts.length ? "Cuentas demo disponibles." : "No hay cuentas demo disponibles. Ejecuta npm run seed.",
            data: { accounts }
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudieron obtener las cuentas demo.")
    }
}

module.exports = {
    demoAccounts,
    register,
    verify,
    resendVerification,
    googleLogin,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
}
