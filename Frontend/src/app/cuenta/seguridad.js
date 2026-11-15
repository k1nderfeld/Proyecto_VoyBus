import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { AppText } from "../../components/AppText"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { PasswordChecklist } from "../../components/PasswordChecklist"
import { RequireAuth } from "../../components/RequireAuth"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { api } from "../../api/client"
import { fieldErrors, isValidNewPassword, newPasswordChecks } from "../../lib/validation"

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" }

// Cambio de contraseña (ACC-04) y estado de la verificación en dos pasos.
export default function SecurityScreen() {
    return (
        <RequireAuth title="Seguridad">
            <SecurityContent />
        </RequireAuth>
    )
}

function SecurityContent() {
    const { user } = useAuth()
    const toast = useToast()
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [saving, setSaving] = useState(false)
    const checks = newPasswordChecks(form.newPassword)

    const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

    const submit = async () => {
        const nextErrors = {}

        if (!form.currentPassword) nextErrors.currentPassword = "Ingresa tu contraseña actual."
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
            const response = await api.post("/auth/change-password", form)
            setForm(emptyForm)
            toast.success(response.message)
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            setErrors(fields)
            // Contraseña actual incorrecta o espera por intentos fallidos: el backend da un mensaje general.
            if (!Object.keys(fields).length) setServerError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Screen>
            <ScreenHeader title="Seguridad" fallback="/perfil" />

            <Card>
                <AppText variant="subtitle">Cambiar contraseña</AppText>
                <AppText variant="caption" tone="muted">
                    Al guardar, se cerrarán tus sesiones en otros dispositivos.
                </AppText>

                {serverError && <Notice tone="danger">{serverError}</Notice>}

                <TextField
                    label="Contraseña actual"
                    icon="lock-closed-outline"
                    value={form.currentPassword}
                    onChangeText={update("currentPassword")}
                    error={errors.currentPassword}
                    secure
                    autoCapitalize="none"
                    autoComplete="current-password"
                />
                <TextField
                    label="Nueva contraseña"
                    icon="key-outline"
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
                    label="Confirmar nueva contraseña"
                    icon="key-outline"
                    value={form.confirmPassword}
                    onChangeText={update("confirmPassword")}
                    error={errors.confirmPassword}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                />
                <Button title="Actualizar contraseña" icon="checkmark-outline" onPress={submit} loading={saving} />
            </Card>

            <Card>
                <View style={styles.row}>
                    <AppText variant="subtitle" style={styles.flex}>
                        Verificación en dos pasos
                    </AppText>
                    <Badge
                        label={user.twoFactorEnabled ? "Activada" : "Desactivada"}
                        tone={user.twoFactorEnabled ? "success" : "neutral"}
                    />
                </View>
                <AppText variant="caption" tone="muted">
                    {user.twoFactorEnabled
                        ? "Al iniciar sesión se te pide el código de tu aplicación autenticadora."
                        : "Cuando esté disponible, podrás activarla con una aplicación autenticadora."}
                </AppText>
            </Card>
        </Screen>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    flex: {
        flex: 1
    }
})
