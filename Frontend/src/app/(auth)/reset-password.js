import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { AuthLayout } from "../../components/AuthLayout"
import { Button } from "../../components/Button"
import { PasswordChecklist } from "../../components/PasswordChecklist"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useToast } from "../../context/ToastContext"
import { api } from "../../api/client"
import { extractToken } from "../../lib/navigation"
import { fieldErrors, isValidNewPassword, newPasswordChecks } from "../../lib/validation"

// Se abre desde el enlace del correo (voybus://reset-password?token=...) o pegando el enlace o el código a mano.
export default function ResetPasswordScreen() {
    const toast = useToast()
    const params = useLocalSearchParams()
    const linkToken = extractToken(Array.isArray(params.token) ? params.token[0] : params.token)

    const [pasted, setPasted] = useState("")
    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)

    const token = linkToken ?? extractToken(pasted)
    const checks = newPasswordChecks(form.newPassword)

    const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

    const submit = async () => {
        const nextErrors = {}

        if (!token) nextErrors.token = "Pega el enlace completo del correo o su código de 64 caracteres."
        if (!isValidNewPassword(form.newPassword)) {
            nextErrors.newPassword = "La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número."
        }
        if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = "Las contraseñas no coinciden."

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSaving(true)
        setErrors({})
        setServerError(null)

        try {
            const response = await api.post(
                "/auth/reset-password",
                { token, newPassword: form.newPassword, confirmPassword: form.confirmPassword },
                { auth: false }
            )
            setDone(true)
            toast.success(response.message)
        } catch (requestError) {
            setErrors(fieldErrors(requestError))
            setServerError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    if (done) {
        return (
            <AuthLayout
                title="Contraseña actualizada"
                description="Ya puedes iniciar sesión con tu nueva contraseña. Por seguridad, cerramos tus otras sesiones."
            >
                <Button title="Iniciar sesión" icon="log-in-outline" onPress={() => router.replace("/login")} />
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Crea una nueva contraseña"
            description="Elige una contraseña que no hayas usado antes en VoyBus."
            footer={<Button title="Volver a iniciar sesión" variant="ghost" onPress={() => router.replace("/login")} />}
        >
            {serverError && <Notice tone="danger">{serverError}</Notice>}

            {linkToken ? (
                <Notice tone="success">Abriste el enlace del correo. Solo falta elegir la nueva contraseña.</Notice>
            ) : (
                <TextField
                    label="Enlace o código del correo"
                    icon="link-outline"
                    placeholder="Pega aquí el enlace que te enviamos"
                    value={pasted}
                    onChangeText={(value) => {
                        setPasted(value)
                        setErrors((current) => ({ ...current, token: undefined }))
                    }}
                    error={errors.token}
                    hint={token ? "Código detectado correctamente." : undefined}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            )}

            <TextField
                label="Nueva contraseña"
                icon="lock-closed-outline"
                placeholder="Nueva contraseña"
                value={form.newPassword}
                onChangeText={update("newPassword")}
                error={errors.newPassword}
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
            />

            <PasswordChecklist
                items={[
                    { label: "Entre 8 y 72 caracteres", met: checks.length },
                    { label: "Al menos una letra", met: checks.letter },
                    { label: "Al menos un número", met: checks.number }
                ]}
            />

            <TextField
                label="Confirmar contraseña"
                icon="lock-closed-outline"
                placeholder="Repite la nueva contraseña"
                value={form.confirmPassword}
                onChangeText={update("confirmPassword")}
                error={errors.confirmPassword}
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={submit}
            />

            <Button title="Guardar contraseña" icon="checkmark-outline" onPress={submit} loading={saving} />
        </AuthLayout>
    )
}
