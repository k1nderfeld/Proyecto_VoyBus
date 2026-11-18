const { OAuth2Client } = require("google-auth-library")
const HttpError = require("./HttpError")

// Verifica el ID token que entrega Google Sign-In en la app (ACC-01, ACC-02).
// GOOGLE_CLIENT_IDS: IDs de cliente OAuth del proyecto en Google Cloud (web, Android, iOS), separados por coma.
const clientIds = () =>
    (process.env.GOOGLE_CLIENT_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)

const client = new OAuth2Client()

const verify = async (idToken) => {
    const audience = clientIds()

    if (!audience.length) {
        throw new HttpError(503, "El inicio de sesión con Google no está disponible por ahora.")
    }

    try {
        const ticket = await client.verifyIdToken({ idToken, audience })
        const payload = ticket.getPayload()

        return {
            sub: payload.sub,
            email: payload.email,
            emailVerified: payload.email_verified === true,
            name: payload.name
        }
    } catch {
        throw new HttpError(401, "No se pudo validar tu cuenta de Google. Inténtalo nuevamente.")
    }
}

module.exports = { verify }
