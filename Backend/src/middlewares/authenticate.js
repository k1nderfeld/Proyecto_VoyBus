const jwt = require("jsonwebtoken")
const Session = require("../models/session")
const authConfig = require("../config/auth")

// Devuelve los datos de la sesión si el token es válido y la sesión sigue activa; si no, null.
const resolveSession = async (req) => {
    const header = req.headers.authorization || ""
    const match = header.match(/^Bearer\s+(.+)$/i)

    if (!match) return null

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
            return null
        }

        return {
            userId: session.userId,
            role: payload.role,
            sessionId: session.id
        }
    } catch {
        return null
    }
}

const authenticate = async (req, res, next) => {
    const auth = await resolveSession(req)

    if (!auth) {
        return res.status(401).json({
            success: false,
            message: "La sesión no es válida o ha expirado."
        })
    }

    req.auth = auth
    next()
}

// Para consultas públicas que muestran algo extra a quien inició sesión.
// Sin token, o con uno inválido, la petición sigue como invitado (req.auth = null).
const optionalAuthenticate = async (req, res, next) => {
    req.auth = await resolveSession(req)
    next()
}

module.exports = authenticate
module.exports.optionalAuthenticate = optionalAuthenticate
