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

class MailService {
    async sendMail({ to, subject, text, html }) {
        if (!transporter) {
            console.warn(`SMTP no configurado: no se envió el correo "${subject}".`)
            return
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
            html
        })
    }

    async sendPasswordResetEmail(to, resetUrl) {
        await this.sendMail({
            to,
            subject: "Restablece tu contraseña de VoyBus",
            text: `Recibimos una solicitud para restablecer tu contraseña. Ingresa al siguiente enlace: ${resetUrl}`,
            html: `<p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p>`
        })
    }

    async sendEmailChangeVerification(to, confirmUrl) {
        await this.sendMail({
            to,
            subject: "Confirma tu nuevo correo de VoyBus",
            text: `Recibimos una solicitud para usar este correo en tu cuenta de VoyBus. Confírmalo en el siguiente enlace: ${confirmUrl}. Si no fuiste tú, ignora este mensaje.`,
            html: `<p>Recibimos una solicitud para usar este correo en tu cuenta de VoyBus.</p><p><a href="${confirmUrl}">Confirmar correo</a></p><p>Si no fuiste tú, ignora este mensaje.</p>`
        })
    }
}

module.exports = new MailService()
