const jwt = require("jsonwebtoken")
const Session = require("../models/session")
const authConfig = require("../config/auth")

const authenticate = async (req, res, next) => {
    const header = req.headers.authorization || ""
    const match = header.match(/^Bearer\s+(.+)$/i)

    if (!match) {
        return res.status(401).json({
            success: false,
            message: "La sesión no es válida o ha expirado."
        })
    }

    try {
        const payload = jwt.verify(match[1], authConfig.jwtSecret)
        const session = await Session.findOne({
            where: { id: payload.jti, revokedAt: null }
        })

        if (
            !session ||
            String(session.userId) !== String(payload.sub) ||
            session.expiresAt <= new Date()
        ) {
            throw new Error()
        }

        req.auth = {
            userId: session.userId,
            role: payload.role,
            sessionId: session.id
        }

        next()
    } catch {
        return res.status(401).json({
            success: false,
            message: "La sesión no es válida o ha expirado."
        })
    }
}

module.exports = authenticate
