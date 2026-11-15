// Envío de SMS. Por ahora es simulado: el mensaje se muestra en la consola del servidor.
// Para enviar SMS reales, reemplazar el cuerpo de send() por la llamada al proveedor
// (por ejemplo Twilio) usando credenciales en variables de entorno. El resto del sistema no cambia.
class SmsService {
    async send(to, message) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("No hay un proveedor de SMS configurado.")
        }

        console.info(`[SMS simulado] Para ${to}: ${message}`)
    }

    async sendVerificationCode(to, code) {
        await this.send(to, `Tu código de verificación de VoyBus es ${code}. Vence en 15 minutos.`)
    }
}

module.exports = new SmsService()
