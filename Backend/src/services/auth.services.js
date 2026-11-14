const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")
const User = require("../models/user")
const Session = require("../models/session")
const db = require("../config/database")
const HttpError = require("../utils/HttpError")
const verifyTotp = require("../utils/totp")
const sendPasswordResetEmail = require("./mail.services")
const authConfig = require("../config/auth")

const dummyPasswordHash = "$2b$12$uCfjYQuaRpqMm7HoqQYv3O0fzoA4vMFpltTS2mqjwLwnl0zCBHT0y"

class AuthService {
    async register(data) {
        const name = data.name.trim()
        const email = data.email?.trim().toLowerCase() || null
        const phone = data.phone?.trim() || null
        const { password } = data

        if (!email && !phone) {
            throw new HttpError(400, "Debes indicar un correo electrónico o un teléfono.")
        }

        const identifiers = []
        if (email) identifiers.push({ email })
        if (phone) identifiers.push({ phone })

        const existing = await User.unscoped().findOne({
            where: { [Op.or]: identifiers }
        })

        if (existing) {
            if (email && existing.email?.toLowerCase() === email) {
                throw new HttpError(409, "El correo electrónico ya está registrado.")
            }
            throw new HttpError(409, "El número de teléfono ya está registrado.")
        }

        const passwordHash = await bcrypt.hash(password, 12)

        try {
            return await User.create({
                name,
                email,
                phone,
                password: passwordHash,
                role: "passenger",
                acceptedTermsAt: new Date()
            })
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                throw new HttpError(409, "El correo electrónico o el teléfono ya están registrados.")
            }
            throw error
        }
    }

    async login(data) {
        const email = data.email?.trim().toLowerCase() || null
        const phone = data.phone?.trim() || null
        const { password, twoFactorCode } = data

        if (!email && !phone) {
            throw new HttpError(400, "Debes indicar un correo electrónico o un teléfono.")
        }

        const identifiers = []
        if (email) identifiers.push({ email })
        if (phone) identifiers.push({ phone })

        const user = await User.findOne({
            where: { [Op.or]: identifiers }
        })

        if (!user) {
            await bcrypt.compare(password, dummyPasswordHash)
            throw new HttpError(401, "Las credenciales no son válidas.")
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const retryAfterSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
            throw new HttpError(
                429,
                "Demasiados intentos fallidos. Inténtalo nuevamente más tarde.",
                { retryAfterSeconds }
            )
        }

        const passwordMatches = await bcrypt.compare(password, user.password)

        if (!passwordMatches) {
            await this.registerFailedAttempt(user, new HttpError(401, "Las credenciales no son válidas."))
        }

        if (user.status === "disabled") {
            throw new HttpError(403, "La cuenta está deshabilitada.")
        }

        if (user.status !== "active") {
            throw new HttpError(
                403,
                "Debes completar la verificación de tu medio de contacto para iniciar sesión.",
                { requiresVerification: true }
            )
        }

        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new HttpError(
                    401,
                    "Ingresa el código de tu aplicación autenticadora.",
                    { requiresTwoFactor: true }
                )
            }

            if (!verifyTotp(user.twoFactorSecret, twoFactorCode)) {
                await this.registerFailedAttempt(user, new HttpError(401, "El código de verificación no es válido."))
            }
        }

        await user.update({ failedLoginAttempts: 0, lockedUntil: null })

        const sessionId = crypto.randomUUID()
        const token = jwt.sign(
            { role: user.role },
            authConfig.jwtSecret,
            {
                subject: String(user.id),
                expiresIn: authConfig.jwtExpiresIn,
                jwtid: sessionId
            }
        )

        const { exp } = jwt.decode(token)

        await Session.create({
            id: sessionId,
            userId: user.id,
            expiresAt: new Date(exp * 1000)
        })

        return {
            token,
            tokenType: "Bearer",
            expiresIn: authConfig.jwtExpiresIn,
            user
        }
    }

    async logout(sessionId) {
        await Session.update(
            { revokedAt: new Date() },
            { where: { id: sessionId, revokedAt: null } }
        )
    }

    async forgotPassword(email) {
        const user = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        })

        if (!user || !user.email || user.status !== "active") return

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
        const resetExpiresAt = new Date(Date.now() + 15 * 60000)

        await user.update({
            passwordResetTokenHash: resetTokenHash,
            passwordResetExpiresAt: resetExpiresAt
        })

        const baseUrl = process.env.PASSWORD_RESET_URL || "http://localhost:3000/reset-password"
        const separator = baseUrl.includes("?") ? "&" : "?"
        const resetUrl = `${baseUrl}${separator}token=${resetToken}`

        try {
            await sendPasswordResetEmail(user.email, resetUrl)
        } catch {
            return
        }
    }

    async resetPassword(data) {
        const resetToken = data.token.trim().toLowerCase()
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
        const user = await User.findOne({
            where: {
                passwordResetTokenHash: resetTokenHash,
                passwordResetExpiresAt: { [Op.gt]: new Date() },
                status: "active"
            }
        })

        if (!user) {
            throw new HttpError(400, "El enlace no es válido o ha expirado.")
        }

        const passwordReused = await bcrypt.compare(data.newPassword, user.password)

        if (passwordReused) {
            throw new HttpError(400, "La nueva contraseña debe ser diferente a la actual.")
        }

        const passwordHash = await bcrypt.hash(data.newPassword, 12)

        await db.transaction(async (transaction) => {
            await user.update({
                password: passwordHash,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
                failedLoginAttempts: 0,
                lockedUntil: null
            }, { transaction })

            await Session.update(
                { revokedAt: new Date() },
                { where: { userId: user.id, revokedAt: null }, transaction }
            )
        })
    }

    async changePassword(data) {
        const user = await User.findByPk(data.userId)

        if (!user) {
            throw new HttpError(401, "La sesión no es válida o ha expirado.")
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const retryAfterSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
            throw new HttpError(
                429,
                "Demasiados intentos fallidos. Inténtalo nuevamente más tarde.",
                { retryAfterSeconds }
            )
        }

        if (user.status !== "active") {
            throw new HttpError(403, "La cuenta no está habilitada.")
        }

        const currentPasswordMatches = await bcrypt.compare(data.currentPassword, user.password)

        if (!currentPasswordMatches) {
            await this.registerFailedAttempt(
                user,
                new HttpError(400, "La contraseña actual no es correcta.")
            )
        }

        const passwordReused = await bcrypt.compare(data.newPassword, user.password)

        if (passwordReused) {
            throw new HttpError(400, "La nueva contraseña debe ser diferente a la actual.")
        }

        const passwordHash = await bcrypt.hash(data.newPassword, 12)

        await db.transaction(async (transaction) => {
            await user.update({
                password: passwordHash,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
                failedLoginAttempts: 0,
                lockedUntil: null
            }, { transaction })

            await Session.update(
                { revokedAt: new Date() },
                {
                    where: {
                        userId: user.id,
                        revokedAt: null,
                        id: { [Op.ne]: data.sessionId }
                    },
                    transaction
                }
            )
        })
    }

    async registerFailedAttempt(user, error) {
        const attempts = user.failedLoginAttempts + 1

        if (attempts >= authConfig.maxFailedAttempts) {
            const lockedUntil = new Date(Date.now() + authConfig.lockMinutes * 60000)
            await user.update({ failedLoginAttempts: 0, lockedUntil })

            throw new HttpError(
                429,
                "Demasiados intentos fallidos. Inténtalo nuevamente más tarde.",
                { retryAfterSeconds: authConfig.lockMinutes * 60 }
            )
        }

        await user.update({ failedLoginAttempts: attempts })
        throw error
    }
}

module.exports = new AuthService()
