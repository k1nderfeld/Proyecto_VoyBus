const QRCode = require("qrcode")
const User = require("../models/user")
const HttpError = require("../utils/HttpError")
const verifyTotp = require("../utils/totp")
const authService = require("./auth.services")

const ISSUER = "VoyBus"

// Configuración de la verificación en dos pasos con una aplicación autenticadora (ACC-01).
// 1. setup: genera una clave nueva (queda pendiente) y su código QR.
// 2. enable: la persona escanea el QR y confirma con un código de 6 dígitos; recién ahí se activa.
class TwoFactorService {
    async setup(userId) {
        const user = await this.findActiveUser(userId)

        if (user.twoFactorEnabled) {
            throw new HttpError(409, "La verificación en dos pasos ya está activada.")
        }

        const secret = verifyTotp.generateSecret()
        const label = encodeURIComponent(`${ISSUER}:${user.email || user.phone}`)
        const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${ISSUER}&algorithm=SHA1&digits=6&period=30`

        await user.update({ twoFactorPendingSecret: secret })

        return {
            secret,
            otpauthUrl,
            qrCode: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 280 })
        }
    }

    async enable(userId, code) {
        const user = await this.findActiveUser(userId)

        if (user.twoFactorEnabled) {
            throw new HttpError(409, "La verificación en dos pasos ya está activada.")
        }

        if (!user.twoFactorPendingSecret) {
            throw new HttpError(400, "Primero genera el código QR para configurar tu aplicación autenticadora.")
        }

        if (!verifyTotp(user.twoFactorPendingSecret, code)) {
            throw new HttpError(400, "El código no es válido. Revisa que la hora del teléfono esté bien e inténtalo de nuevo.")
        }

        await user.update({
            twoFactorEnabled: true,
            twoFactorSecret: user.twoFactorPendingSecret,
            twoFactorPendingSecret: null
        })

        return user
    }

    // Para desactivarla se piden la contraseña y un código, así no basta con tener el teléfono desbloqueado.
    async disable(userId, { currentPassword, code }) {
        const user = await this.findActiveUser(userId)

        if (!user.twoFactorEnabled) {
            throw new HttpError(409, "La verificación en dos pasos no está activada.")
        }

        await authService.verifyCurrentPassword(user, currentPassword)

        if (!verifyTotp(user.twoFactorSecret, code)) {
            await authService.registerFailedAttempt(user, new HttpError(400, "El código de verificación no es válido."))
        }

        await user.update({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorPendingSecret: null,
            failedLoginAttempts: 0
        })

        return user
    }

    async findActiveUser(userId) {
        const user = await User.findByPk(userId)

        if (!user) {
            throw new HttpError(401, "La sesión no es válida o ha expirado.")
        }

        if (user.status !== "active") {
            throw new HttpError(403, "La cuenta no está habilitada.")
        }

        return user
    }
}

module.exports = new TwoFactorService()
