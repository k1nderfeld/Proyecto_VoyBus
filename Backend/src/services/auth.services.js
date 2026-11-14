const bcrypt = require("bcryptjs")
const { Op } = require("sequelize")
const User = require("../models/user")
const HttpError = require("../utils/HttpError")

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
}

module.exports = new AuthService()
