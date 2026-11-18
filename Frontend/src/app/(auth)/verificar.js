import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { AppText } from "../../components/AppText"
import { AuthLayout } from "../../components/AuthLayout"
import { Button } from "../../components/Button"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { api } from "../../api/client"
import { safeNext } from "../../lib/navigation"
import { fieldErrors } from "../../lib/validation"

const RESEND_SECONDS = 60
const first = (value) => (Array.isArray(value) ? value[0] : value)

// Verificación del medio de contacto (ACC-01). Se llega después de registrarse o al intentar entrar
// con una cuenta sin verificar (ACC-02). Al verificar, la sesión queda iniciada.
export default function VerifyAccountScreen() {
    const { verifyAccount } = useAuth()
    const toast = useToast()
    const params = useLocalSearchParams()
    const email = first(params.email)
    const phone = first(params.phone)
    const next = safeNext(params.next)
    const contact = email ? { email } : { phone }

    const [code, setCode] = useState("")
    const [error, setError] = useState(null)
    const [verifying, setVerifying] = useState(false)
    const [resending, setResending] = useState(false)
    const [verified, setVerified] = useState(false)
    // Si se acaba de enviar un código (registro o "Verificar ahora"), se espera antes de permitir otro.
    const [cooldown, setCooldown] = useState(first(params.sent) === "1" ? RESEND_SECONDS : 0)

    useEffect(() => {
        if (cooldown <= 0) return undefined
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    if (!email && !phone) {
        return (
            <AuthLayout title="Falta tu correo o teléfono" description="Vuelve a iniciar sesión para verificar tu cuenta.">
                <Button title="Ir a iniciar sesión" onPress={() => router.replace("/login")} />
            </AuthLayout>
        )
    }

    const destination = email ? `tu correo ${email}` : `tu teléfono ${phone} (por SMS)`

    const submit = async () => {
        if (!/^\d{6}$/.test(code.trim())) {
            setError("Ingresa los 6 dígitos del código.")
            return
        }

        setVerifying(true)
        setError(null)

        try {
            const response = await verifyAccount({ ...contact, code: code.trim() })
            toast.success(response.message)
            setVerified(true)
        } catch (requestError) {
            setError(fieldErrors(requestError).code || requestError.message)
        } finally {
            setVerifying(false)
        }
    }

    const resend = async () => {
        setResending(true)
        setError(null)

        try {
            const response = await api.post("/auth/verify/resend", contact, { auth: false })
            toast.success(response.message)
            setCode("")
            setCooldown(RESEND_SECONDS)
        } catch (requestError) {
            if (requestError.data?.retryAfterSeconds) setCooldown(requestError.data.retryAfterSeconds)
            else toast.error(requestError.message)
        } finally {
            setResending(false)
        }
    }

    // Después de verificar se ofrece, de forma opcional, activar la verificación en dos pasos (ACC-01).
    if (verified) {
        return (
            <AuthLayout
                title="¡Cuenta verificada!"
                description="Ya iniciaste sesión. Puedes proteger tu cuenta con la verificación en dos pasos."
            >
                <Notice tone="info" title="Verificación en dos pasos (opcional)">
                    Además de tu contraseña, al iniciar sesión se pedirá un código de una aplicación autenticadora.
                </Notice>
                <Button title="Activarla ahora" icon="shield-checkmark-outline" onPress={() => router.replace("/cuenta/seguridad")} />
                <Button title="Ahora no" variant="secondary" onPress={() => router.replace(next)} />
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Verifica tu cuenta"
            description={`Ingresa el código de 6 dígitos que enviamos a ${destination}. Vence en 15 minutos.`}
            footer={<Button title="Volver a iniciar sesión" variant="ghost" onPress={() => router.replace("/login")} />}
        >
            <TextField
                label="Código de verificación"
                icon="keypad-outline"
                placeholder="123456"
                value={code}
                onChangeText={(value) => {
                    setCode(value.replace(/\D/g, "").slice(0, 6))
                    setError(null)
                }}
                error={error}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                returnKeyType="go"
                onSubmitEditing={submit}
            />

            <Button title="Verificar" icon="checkmark-circle-outline" onPress={submit} loading={verifying} />

            <View style={styles.resend}>
                <AppText variant="caption" tone="muted">
                    ¿No te llegó el código?
                </AppText>
                <Button
                    title={cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar código"}
                    variant="ghost"
                    size="sm"
                    onPress={resend}
                    loading={resending}
                    disabled={cooldown > 0}
                />
            </View>
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    resend: {
        alignItems: "center",
        gap: 2
    }
})
