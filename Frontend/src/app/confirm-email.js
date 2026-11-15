import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { AuthLayout } from "../components/AuthLayout"
import { Button } from "../components/Button"
import { Notice } from "../components/States"
import { TextField } from "../components/TextField"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { api } from "../api/client"
import { extractToken } from "../lib/navigation"

// Confirma el nuevo correo (ACC-05). Se abre desde el enlace enviado al correo nuevo
// (voybus://confirm-email?token=...) o pegando el enlace o el código. No requiere sesión.
export default function ConfirmEmailScreen() {
    const { user, refresh } = useAuth()
    const toast = useToast()
    const params = useLocalSearchParams()
    const linkToken = extractToken(Array.isArray(params.token) ? params.token[0] : params.token)

    const [pasted, setPasted] = useState("")
    const [fieldError, setFieldError] = useState(null)
    const [serverError, setServerError] = useState(null)
    const [sending, setSending] = useState(false)
    const [confirmedEmail, setConfirmedEmail] = useState(null)

    const token = linkToken ?? extractToken(pasted)

    const confirm = async () => {
        if (!token) {
            setFieldError("Pega el enlace completo del correo o su código de 64 caracteres.")
            return
        }

        setSending(true)
        setFieldError(null)
        setServerError(null)

        try {
            const response = await api.post("/users/email-change/confirm", { token }, { auth: false })
            setConfirmedEmail(response.data.email)
            toast.success(response.message)
            if (user) await refresh().catch(() => {})
        } catch (requestError) {
            setServerError(requestError.message)
        } finally {
            setSending(false)
        }
    }

    if (confirmedEmail) {
        return (
            <AuthLayout
                title="Correo actualizado"
                description={`Desde ahora tu cuenta usa ${confirmedEmail}. Úsalo para iniciar sesión.`}
            >
                <Button
                    title={user ? "Volver a mi perfil" : "Iniciar sesión"}
                    onPress={() => router.replace(user ? "/cuenta/perfil" : "/login")}
                />
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Confirma tu nuevo correo"
            description="Tu correo actual sigue activo hasta que confirmes el nuevo."
            footer={<Button title="Ir al inicio" variant="ghost" onPress={() => router.replace("/")} />}
        >
            {serverError && <Notice tone="danger">{serverError}</Notice>}

            {linkToken ? (
                <Notice tone="success">Abriste el enlace del correo. Solo falta confirmarlo.</Notice>
            ) : (
                <TextField
                    label="Enlace o código del correo"
                    icon="link-outline"
                    placeholder="Pega aquí el enlace que te enviamos"
                    value={pasted}
                    onChangeText={(value) => {
                        setPasted(value)
                        setFieldError(null)
                    }}
                    error={fieldError}
                    hint={token ? "Código detectado correctamente." : "El enlace vence 30 minutos después de pedirlo."}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            )}

            <Button title="Confirmar correo" icon="checkmark-circle-outline" onPress={confirm} loading={sending} />
        </AuthLayout>
    )
}
