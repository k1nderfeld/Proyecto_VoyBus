const nodemailer = require("nodemailer")

const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
)

const transporter = smtpConfigured
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })
    : null

const sendPasswordResetEmail = async (to, resetUrl) => {
    if (!transporter) return

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: "Restablece tu contraseña de VoyBus",
        text: `Recibimos una solicitud para restablecer tu contraseña. Ingresa al siguiente enlace: ${resetUrl}`,
        html: `<p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p>`
    })
}

module.exports = sendPasswordResetEmail
