import { useState } from "react"
import { router } from "expo-router"
import { AuthLayout } from "../../components/AuthLayout"
import { Button } from "../../components/Button"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useToast } from "../../context/ToastContext"
import { api } from "../../api/client"
import { isEmail } from "../../lib/validation"

export default function ForgotPasswordScreen() {
    const toast = useToast()
    const [email, setEmail] = useState("")
    const [fieldError, setFieldError] = useState(null)
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    // El backend responde lo mismo exista o no la cuenta, para no revelar qué correos están registrados.
    const request = async () => {
        if (!isEmail(email)) {
            setFieldError("Ingresa un correo electrónico válido.")
            return
        }

        setSending(true)
        setFieldError(null)

        try {
            const response = await api.post("/auth/forgot-password", { email: email.trim() }, { auth: false })
            setSent(true)
            toast.success(response.message)
        } catch (requestError) {
            toast.error(requestError.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthLayout
            title={sent ? "Revisa tu correo" : "Recupera tu contraseña"}
            description={
                sent
                    ? "Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Vence en 15 minutos."
                    : "Ingresa el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña."
            }
            footer={<Button title="Volver a iniciar sesión" variant="ghost" onPress={() => router.replace("/login")} />}
        >
            {sent ? (
                <>
                    <Notice tone="info" title="¿Abriste el correo en otro dispositivo?">
                        Copia el enlace o el código del correo y pégalo en la pantalla para restablecer la contraseña.
                    </Notice>
                    <Button
                        title="Tengo el enlace o el código"
                        icon="key-outline"
                        onPress={() => router.push("/reset-password")}
                    />
                    <Button title="Reenviar correo" variant="secondary" onPress={request} loading={sending} />
                </>
            ) : (
                <>
                    <TextField
                        label="Correo electrónico"
                        icon="mail-outline"
                        placeholder="tu@correo.cl"
                        value={email}
                        onChangeText={setEmail}
                        error={fieldError}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="send"
                        onSubmitEditing={request}
                    />
                    <Button title="Enviar enlace" icon="paper-plane-outline" onPress={request} loading={sending} />
                </>
            )}
        </AuthLayout>
    )
}
