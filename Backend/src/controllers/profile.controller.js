const profileService = require("../services/profile.services")
const respondWithError = require("../utils/respondWithError")

const getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfile(req.auth.userId)

        return res.json({
            success: true,
            message: "Perfil obtenido correctamente.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo obtener el perfil.")
    }
}

const updateProfile = async (req, res) => {
    try {
        const user = await profileService.updateProfile(req.auth.userId, req.body)

        return res.json({
            success: true,
            message: "Perfil actualizado correctamente.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo actualizar el perfil.")
    }
}

const updatePhoto = async (req, res) => {
    try {
        const user = await profileService.updatePhoto(req.auth.userId, req.file)

        return res.json({
            success: true,
            message: "Foto de perfil actualizada correctamente.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo actualizar la foto de perfil.")
    }
}

const removePhoto = async (req, res) => {
    try {
        const user = await profileService.removePhoto(req.auth.userId)

        return res.json({
            success: true,
            message: "Foto de perfil eliminada correctamente.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo eliminar la foto de perfil.")
    }
}

const requestEmailChange = async (req, res) => {
    try {
        const pending = await profileService.requestEmailChange(req.auth.userId, req.body)

        return res.json({
            success: true,
            message: "Te enviamos un enlace para confirmar tu nuevo correo. Tu correo actual seguirá activo hasta que lo confirmes.",
            data: pending
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo solicitar el cambio de correo.")
    }
}

const confirmEmailChange = async (req, res) => {
    try {
        const user = await profileService.confirmEmailChange(req.body.token)

        return res.json({
            success: true,
            message: "Tu correo fue actualizado.",
            data: { email: user.email }
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo confirmar el cambio de correo.")
    }
}

const cancelEmailChange = async (req, res) => {
    try {
        const user = await profileService.cancelEmailChange(req.auth.userId)

        return res.json({
            success: true,
            message: "Se canceló el cambio de correo.",
            data: user
        })
    } catch (error) {
        return respondWithError(res, error, "No se pudo cancelar el cambio de correo.")
    }
}

module.exports = {
    getProfile,
    updateProfile,
    updatePhoto,
    removePhoto,
    requestEmailChange,
    confirmEmailChange,
    cancelEmailChange
}
