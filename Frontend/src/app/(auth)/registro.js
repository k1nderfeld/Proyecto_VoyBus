import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { Link, Redirect, router, useLocalSearchParams } from "expo-router"
import { AppText } from "../../components/AppText"
import { AuthLayout } from "../../components/AuthLayout"
import { Button } from "../../components/Button"
import { Checkbox } from "../../components/Checkbox"
import { PasswordChecklist } from "../../components/PasswordChecklist"
import { Segmented } from "../../components/Segmented"
import { TextField } from "../../components/TextField"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { safeNext } from "../../lib/navigation"
import { fieldErrors, isEmail, isPhone, isValidPassword, passwordChecks } from "../../lib/validation"

const modes = [
    { value: "email", label: "Correo", icon: "mail-outline" },
    { value: "phone", label: "Teléfono", icon: "call-outline" }
]

export default function RegisterScreen() {
    const { user, register } = useAuth()
    const toast = useToast()
    const params = useLocalSearchParams()
    const next = safeNext(params.next)

    const [mode, setMode] = useState("email")
    const [form, setForm] = useState({
        name: "",
        identifier: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
    })
    const [errors, setErrors] = useState({})
    const [sending, setSending] = useState(false)
    const checks = passwordChecks(form.password)

    if (user) return <Redirect href={next} />

    const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

    const changeMode = (value) => {
        setMode(value)
        setErrors((current) => ({ ...current, identifier: undefined }))
    }

    const submit = async () => {
        const nextErrors = {}
        const name = form.name.trim()
        const identifier = form.identifier.trim()

        if (name.length < 2 || name.length > 80) nextErrors.name = "El nombre debe tener entre 2 y 80 caracteres."
        if (mode === "email" && !isEmail(identifier)) nextErrors.identifier = "Ingresa un correo electrónico válido."
        if (mode === "phone" && !isPhone(identifier)) {
            nextErrors.identifier = "Ingresa un teléfono válido, con entre 8 y 15 dígitos."
        }
        if (!isValidPassword(form.password)) nextErrors.password = "La contraseña no cumple con los requisitos."
        if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Las contraseñas no coinciden."
        if (!form.acceptTerms) nextErrors.acceptTerms = "Debes aceptar los términos y la política de privacidad."

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSending(true)
        setErrors({})

        try {
            const response = await register({
                name,
                ...(mode === "email" ? { email: identifier } : { phone: identifier }),
                password: form.password,
                confirmPassword: form.confirmPassword,
                acceptTerms: true
            })
            toast.success(response.message)

            // La cuenta queda pendiente: se verifica con el código enviado al correo o por SMS (ACC-01).
            const contact = response.data.user.email
                ? `email=${encodeURIComponent(response.data.user.email)}`
                : `phone=${encodeURIComponent(response.data.user.phone)}`
            const sent = response.data.verification.codeSent ? "1" : "0"
            router.replace(`/verificar?${contact}&sent=${sent}&next=${encodeURIComponent(next)}`)
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            setErrors({ ...fields, identifier: fields.email || fields.phone })
            toast.error(requestError.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthLayout
            title="Crea tu cuenta"
            description="Regístrate como pasajero para guardar favoritos y revisar tu historial."
            footer={
                <View style={styles.row}>
                    <AppText tone="muted">¿Ya tienes cuenta?</AppText>
                    <Link href={next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"} replace>
                        <AppText tone="primary" weight="bold">
                            Iniciar sesión
                        </AppText>
                    </Link>
                </View>
            }
        >
            <TextField
                label="Nombre"
                icon="person-outline"
                placeholder="Tu nombre"
                value={form.name}
                onChangeText={update("name")}
                error={errors.name}
                autoComplete="name"
                textContentType="name"
            />

            <Segmented options={modes} value={mode} onChange={changeMode} accessibilityLabel="Medio de contacto" />

            <TextField
                label={mode === "email" ? "Correo electrónico" : "Teléfono"}
                icon={mode === "email" ? "mail-outline" : "call-outline"}
                placeholder={mode === "email" ? "tu@correo.cl" : "+56912345678"}
                value={form.identifier}
                onChangeText={update("identifier")}
                error={errors.identifier}
                keyboardType={mode === "email" ? "email-address" : "phone-pad"}
                autoCapitalize="none"
                autoComplete={mode === "email" ? "email" : "tel"}
            />

            <TextField
                label="Contraseña"
                icon="lock-closed-outline"
                placeholder="Crea una contraseña"
                value={form.password}
                onChangeText={update("password")}
                error={errors.password}
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
            />

            <PasswordChecklist
                items={[
                    { label: "Entre 8 y 15 caracteres", met: checks.length },
                    { label: "Una letra mayúscula", met: checks.upper },
                    { label: "Una letra minúscula", met: checks.lower },
                    { label: "Un número", met: checks.number },
                    { label: "Un símbolo", met: checks.symbol }
                ]}
            />

            <TextField
                label="Confirmar contraseña"
                icon="lock-closed-outline"
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChangeText={update("confirmPassword")}
                error={errors.confirmPassword}
                secure
                autoCapitalize="none"
                autoComplete="new-password"
            />

            <Checkbox
                checked={form.acceptTerms}
                onChange={update("acceptTerms")}
                label="Acepto los términos de uso y la política de privacidad de VoyBus."
                error={errors.acceptTerms}
            />

            <Button title="Crear cuenta" icon="person-add-outline" onPress={submit} loading={sending} />
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 6,
        flexWrap: "wrap",
        justifyContent: "center"
    }
})
