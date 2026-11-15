const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")
const User = require("../models/user")
const Session = require("../models/session")
const db = require("../config/database")
const HttpError = require("../utils/HttpError")
const verifyTotp = require("../utils/totp")
const mailService = require("./mail.services")
const smsService = require("./sms.services")
const authConfig = require("../config/auth")
const googleVerifier = require("../utils/googleVerifier")

const dummyPasswordHash = "$2b$12$uCfjYQuaRpqMm7HoqQYv3O0fzoA4vMFpltTS2mqjwLwnl0zCBHT0y"

// Verificación del medio de contacto (ACC-01).
const VERIFICATION_MINUTES = 15
const VERIFICATION_MAX_ATTEMPTS = 5
const VERIFICATION_RESEND_SECONDS = 60

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex")

// Con correo se verifica el correo; si la cuenta solo tiene teléfono, el teléfono.
const verificationChannel = (user) => (user.email ? "email" : "phone")

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
        let user

        try {
            // La cuenta queda pendiente hasta verificar el correo o el teléfono (ACC-01).
            user = await User.create({
                name,
                email,
                phone,
                password: passwordHash,
                role: "passenger",
                status: "pending",
                acceptedTermsAt: new Date()
            })
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                throw new HttpError(409, "El correo electrónico o el teléfono ya están registrados.")
            }
            throw error
        }

        // Si el envío falla, la cuenta igual queda creada y se puede pedir otro código.
        const codeSent = await this.sendVerificationCode(user).then(() => true, () => false)

        return { user, channel: verificationChannel(user), codeSent }
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
                { requiresVerification: true, channel: verificationChannel(user) }
            )
        }

        await this.assertTwoFactor(user, twoFactorCode)

        return this.createSession(user)
    }

    // Si la cuenta tiene la verificación en dos pasos activada, exige y comprueba el código (ACC-02).
    async assertTwoFactor(user, twoFactorCode) {
        if (!user.twoFactorEnabled) return

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

    // Crea la sesión (token JWT asociado a una fila de Session) que usan login, verificación y Google.
    async createSession(user) {
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

    // Envía un código de 6 dígitos al correo o, si no hay correo, al teléfono. Se guarda solo su hash.
    async sendVerificationCode(user) {
        const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0")

        await user.update({
            verificationCodeHash: hashCode(code),
            verificationExpiresAt: new Date(Date.now() + VERIFICATION_MINUTES * 60000),
            verificationAttempts: 0,
            verificationSentAt: new Date()
        })

        if (verificationChannel(user) === "email") {
            await mailService.sendVerificationCode(user.email, code)
        } else {
            await smsService.sendVerificationCode(user.phone, code)
        }
    }

    async findPendingUser(data) {
        const email = data.email?.trim().toLowerCase() || null
        const phone = data.phone?.trim() || null

        if (!email && !phone) {
            throw new HttpError(400, "Debes indicar un correo electrónico o un teléfono.")
        }

        return User.findOne({ where: email ? { email } : { phone } })
    }

    // Verifica el código y, si es correcto, activa la cuenta e inicia sesión de inmediato.
    async verifyContact(data) {
        const user = await this.findPendingUser(data)
        const invalid = new HttpError(400, "El código no es válido o ha expirado.")

        if (!user || user.status !== "pending" || !user.verificationCodeHash) throw invalid

        if (user.verificationExpiresAt <= new Date()) {
            throw new HttpError(400, "El código expiró. Pide uno nuevo.", { expired: true })
        }

        if (user.verificationAttempts >= VERIFICATION_MAX_ATTEMPTS) {
            throw new HttpError(429, "Demasiados intentos con este código. Pide uno nuevo.", { expired: true })
        }

        const expected = Buffer.from(user.verificationCodeHash)
        const received = Buffer.from(hashCode(String(data.code).trim()))

        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            await user.update({ verificationAttempts: user.verificationAttempts + 1 })
            throw invalid
        }

        await user.update({
            status: "active",
            verificationCodeHash: null,
            verificationExpiresAt: null,
            verificationAttempts: 0,
            verificationSentAt: null
        })

        return this.createSession(user)
    }

    // Reenvía el código. Para no revelar qué cuentas existen, responde igual si no hay nada que verificar.
    async resendVerification(data) {
        const user = await this.findPendingUser(data)

        if (!user || user.status !== "pending") return

        const elapsed = user.verificationSentAt ? (Date.now() - user.verificationSentAt.getTime()) / 1000 : Infinity

        if (elapsed < VERIFICATION_RESEND_SECONDS) {
            const retryAfterSeconds = Math.ceil(VERIFICATION_RESEND_SECONDS - elapsed)
            throw new HttpError(429, `Espera ${retryAfterSeconds} segundos para pedir otro código.`, { retryAfterSeconds })
        }

        await this.sendVerificationCode(user)
    }

    // Inicio de sesión o registro con Google (ACC-01, ACC-02). La app envía el ID token que entrega Google;
    // el backend lo verifica con las credenciales del proyecto (GOOGLE_CLIENT_IDS).
    async googleLogin(data) {
        const profile = await googleVerifier.verify(data.idToken)

        if (!profile.emailVerified) {
            throw new HttpError(400, "Tu cuenta de Google no tiene el correo verificado.")
        }

        const email = profile.email.toLowerCase()
        let user = await User.findOne({ where: { googleId: profile.sub } })

        if (!user) {
            user = await User.findOne({ where: { email } })

            if (user) {
                // Cuenta existente con el mismo correo: se vincula. Google ya verificó el correo.
                await user.update({
                    googleId: profile.sub,
                    ...(user.status === "pending" && {
                        status: "active",
                        verificationCodeHash: null,
                        verificationExpiresAt: null
                    })
                })
            } else {
                if (data.acceptTerms !== true) {
                    throw new HttpError(
                        400,
                        "Debes aceptar los términos y la política de privacidad para crear tu cuenta.",
                        { requiresTerms: true }
                    )
                }

                // Sin contraseña propia: se guarda una aleatoria y, si la quiere, puede crearla con "Recuperar contraseña".
                user = await User.create({
                    name: profile.name || email.split("@")[0],
                    email,
                    password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
                    role: "passenger",
                    status: "active",
                    googleId: profile.sub,
                    acceptedTermsAt: new Date()
                })
            }
        }

        if (user.status === "disabled") {
            throw new HttpError(403, "La cuenta está deshabilitada.")
        }

        await this.assertTwoFactor(user, data.twoFactorCode)

        return this.createSession(user)
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
            await mailService.sendPasswordResetEmail(user.email, resetUrl)
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

        if (user.status !== "active") {
            throw new HttpError(403, "La cuenta no está habilitada.")
        }

        await this.verifyCurrentPassword(user, data.currentPassword)

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

    // Confirma que quien hace un cambio sensible es el dueño de la cuenta.
    // Respeta el bloqueo temporal y cuenta los intentos fallidos.
    async verifyCurrentPassword(user, password) {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const retryAfterSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
            throw new HttpError(
                429,
                "Demasiados intentos fallidos. Inténtalo nuevamente más tarde.",
                { retryAfterSeconds }
            )
        }

        const currentPasswordMatches = await bcrypt.compare(password, user.password)

        if (!currentPasswordMatches) {
            await this.registerFailedAttempt(
                user,
                new HttpError(400, "La contraseña actual no es correcta.")
            )
        }
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
