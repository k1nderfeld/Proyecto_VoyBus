const crypto = require("crypto")
const fs = require("fs/promises")
const path = require("path")
const { Op, fn, col, where } = require("sequelize")
const User = require("../models/user")
const HttpError = require("../utils/HttpError")
const authService = require("./auth.services")
const mailService = require("./mail.services")
const uploadsConfig = require("../config/uploads")

const EMAIL_CHANGE_MINUTES = 30

// Se valida el contenido real del archivo (firma), no solo el tipo que declara el cliente.
const imageTypes = [
    {
        extension: "jpg",
        matches: (buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    },
    {
        extension: "png",
        matches: (buffer) => buffer.length > 8 &&
            buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    },
    {
        extension: "webp",
        matches: (buffer) => buffer.length > 12 &&
            buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP"
    }
]

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

const isUniqueError = (error) => error.name === "SequelizeUniqueConstraintError"

class ProfileService {
    async getProfile(userId) {
        return this.findActiveUser(userId)
    }

    async updateProfile(userId, data) {
        const user = await this.findActiveUser(userId)
        const changes = {}

        if (data.name !== undefined) {
            changes.name = data.name.trim()
        }

        if (data.alias !== undefined) {
            const alias = data.alias ? data.alias.trim() : null

            if (alias && alias.toLowerCase() !== user.alias?.toLowerCase()) {
                await this.assertAliasAvailable(alias, user.id)
            }

            changes.alias = alias
        }

        try {
            await user.update(changes)
        } catch (error) {
            if (isUniqueError(error)) {
                throw new HttpError(409, "El alias ya está en uso.")
            }
            throw error
        }

        return user
    }

    async updatePhoto(userId, file) {
        if (!file) {
            throw new HttpError(400, "Debes adjuntar una imagen en el campo \"photo\".")
        }

        const imageType = imageTypes.find((type) => type.matches(file.buffer))

        if (!imageType) {
            throw new HttpError(400, "La imagen debe ser JPG, PNG o WEBP.")
        }

        const user = await this.findActiveUser(userId)
        const previousPhotoUrl = user.photoUrl
        const fileName = `${user.id}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${imageType.extension}`
        const photoUrl = `${uploadsConfig.avatarPublicPath}/${fileName}`

        await fs.writeFile(path.join(uploadsConfig.avatarsDir, fileName), file.buffer)

        try {
            await user.update({ photoUrl })
        } catch (error) {
            await this.removeAvatarFile(photoUrl)
            throw error
        }

        await this.removeAvatarFile(previousPhotoUrl)
        return user
    }

    async removePhoto(userId) {
        const user = await this.findActiveUser(userId)
        const previousPhotoUrl = user.photoUrl

        if (!previousPhotoUrl) {
            throw new HttpError(404, "No tienes una foto de perfil.")
        }

        await user.update({ photoUrl: null })
        await this.removeAvatarFile(previousPhotoUrl)
        return user
    }

    // El correo nuevo queda pendiente y solo reemplaza al actual cuando se confirma desde el enlace.
    async requestEmailChange(userId, data) {
        const user = await this.findActiveUser(userId)

        await authService.verifyCurrentPassword(user, data.currentPassword)

        const newEmail = data.newEmail.trim().toLowerCase()

        if (user.email === newEmail) {
            throw new HttpError(400, "El nuevo correo debe ser distinto al actual.")
        }

        await this.assertEmailAvailable(newEmail, user.id)

        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + EMAIL_CHANGE_MINUTES * 60000)

        await user.update({
            pendingEmail: newEmail,
            emailChangeTokenHash: hashToken(token),
            emailChangeExpiresAt: expiresAt,
            failedLoginAttempts: 0
        })

        const baseUrl = process.env.EMAIL_CHANGE_URL || "http://localhost:3000/confirm-email"
        const separator = baseUrl.includes("?") ? "&" : "?"
        const confirmUrl = `${baseUrl}${separator}token=${token}`

        try {
            await mailService.sendEmailChangeVerification(newEmail, confirmUrl)
        } catch {
            await this.clearEmailChange(user)
            throw new HttpError(502, "No se pudo enviar el correo de verificación. Inténtalo nuevamente.")
        }

        return {
            pendingEmail: newEmail,
            expiresAt
        }
    }

    async confirmEmailChange(token) {
        const user = await User.findOne({
            where: {
                emailChangeTokenHash: hashToken(token.trim().toLowerCase()),
                emailChangeExpiresAt: { [Op.gt]: new Date() },
                status: "active"
            }
        })

        if (!user || !user.pendingEmail) {
            throw new HttpError(400, "El enlace no es válido o ha expirado.")
        }

        const newEmail = user.pendingEmail

        try {
            await this.assertEmailAvailable(newEmail, user.id)

            // Se invalida cualquier enlace de recuperación enviado al correo anterior.
            await user.update({
                email: newEmail,
                pendingEmail: null,
                emailChangeTokenHash: null,
                emailChangeExpiresAt: null,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null
            })
        } catch (error) {
            if (error instanceof HttpError || isUniqueError(error)) {
                await this.clearEmailChange(user)
                throw new HttpError(409, "El correo electrónico ya está registrado.")
            }
            throw error
        }

        return user
    }

    async cancelEmailChange(userId) {
        const user = await this.findActiveUser(userId)

        if (!user.pendingEmail) {
            throw new HttpError(404, "No tienes un cambio de correo pendiente.")
        }

        await this.clearEmailChange(user)
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

    // Se incluyen cuentas eliminadas (paranoid) porque siguen ocupando el valor en la base de datos.
    async assertAliasAvailable(alias, userId) {
        const existing = await User.findOne({
            where: {
                [Op.and]: [
                    where(fn("lower", col("alias")), alias.toLowerCase()),
                    { id: { [Op.ne]: userId } }
                ]
            },
            paranoid: false
        })

        if (existing) {
            throw new HttpError(409, "El alias ya está en uso.")
        }
    }

    async assertEmailAvailable(email, userId) {
        const existing = await User.findOne({
            where: { email, id: { [Op.ne]: userId } },
            paranoid: false
        })

        if (existing) {
            throw new HttpError(409, "El correo electrónico ya está registrado.")
        }
    }

    async clearEmailChange(user) {
        await user.update({
            pendingEmail: null,
            emailChangeTokenHash: null,
            emailChangeExpiresAt: null
        })
    }

    async removeAvatarFile(photoUrl) {
        if (!photoUrl || !photoUrl.startsWith(`${uploadsConfig.avatarPublicPath}/`)) return

        const fileName = path.basename(photoUrl)
        await fs.unlink(path.join(uploadsConfig.avatarsDir, fileName)).catch(() => {})
    }
}

module.exports = new ProfileService()
