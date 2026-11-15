import { useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Link, Redirect, router, useLocalSearchParams } from "expo-router"
import { AppText } from "../../components/AppText"
import { AuthLayout } from "../../components/AuthLayout"
import { Button } from "../../components/Button"
import { Segmented } from "../../components/Segmented"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { safeNext } from "../../lib/navigation"
import { fieldErrors } from "../../lib/validation"

// Cuenta demo creada por "npm run seed" en el backend. Solo se ofrece en modo desarrollo.
const demoCredentials = { email: "pasajero@voybus.cl", password: "Demo123!" }

const modes = [
    { value: "email", label: "Correo", icon: "mail-outline" },
    { value: "phone", label: "Teléfono", icon: "call-outline" }
]

export default function LoginScreen() {
    const { user, login } = useAuth()
    const toast = useToast()
    const params = useLocalSearchParams()
    const next = safeNext(params.next)
    const passwordRef = useRef(null)

    const [mode, setMode] = useState("email")
    const [form, setForm] = useState({ identifier: "", password: "", twoFactorCode: "" })
    const [twoFactor, setTwoFactor] = useState(false)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [sending, setSending] = useState(false)

    if (user) return <Redirect href={next} />

    const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

    const changeMode = (value) => {
        setMode(value)
        setErrors({})
        setServerError(null)
    }

    const fillDemo = () => {
        setMode("email")
        setTwoFactor(false)
        setErrors({})
        setServerError(null)
        setForm({ identifier: demoCredentials.email, password: demoCredentials.password, twoFactorCode: "" })
    }

    const submit = async () => {
        const nextErrors = {}
        const identifier = form.identifier.trim()

        if (!identifier) nextErrors.identifier = `Ingresa tu ${mode === "email" ? "correo electrónico" : "teléfono"}.`
        if (!form.password) nextErrors.password = "Ingresa tu contraseña."
        if (twoFactor && !/^\d{6}$/.test(form.twoFactorCode.trim())) {
            nextErrors.twoFactorCode = "El código debe tener 6 dígitos."
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSending(true)
        setErrors({})
        setServerError(null)

        try {
            await login({
                password: form.password,
                ...(mode === "email" ? { email: identifier } : { phone: identifier }),
                ...(twoFactor ? { twoFactorCode: form.twoFactorCode.trim() } : {})
            })
            // Al quedar la sesión iniciada, <Redirect> lleva a la pantalla pedida.
            toast.success("Sesión iniciada correctamente.")
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            setErrors({ ...fields, identifier: fields.email || fields.phone })

            if (requestError.data?.requiresTwoFactor) {
                setTwoFactor(true)
                toast.info("Ingresa el código de tu aplicación autenticadora para continuar.")
            } else {
                setServerError(requestError.message)
            }
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthLayout
            title="Inicia sesión"
            description="Accede para guardar tus favoritos y revisar tus viajes por Antofagasta."
            footer={
                <>
                    <View style={styles.row}>
                        <AppText tone="muted">¿Aún no tienes cuenta?</AppText>
                        <Link href={next !== "/" ? `/registro?next=${encodeURIComponent(next)}` : "/registro"} replace>
                            <AppText tone="primary" weight="bold">
                                Crear una cuenta
                            </AppText>
                        </Link>
                    </View>
                    <Button title="Continuar como invitado" variant="ghost" onPress={() => router.replace("/")} />
                </>
            }
        >
            <Segmented options={modes} value={mode} onChange={changeMode} accessibilityLabel="Medio de acceso" />

            {serverError && <Notice tone="danger">{serverError}</Notice>}

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
                textContentType={mode === "email" ? "emailAddress" : "telephoneNumber"}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <TextField
                ref={passwordRef}
                label="Contraseña"
                icon="lock-closed-outline"
                placeholder="Tu contraseña"
                value={form.password}
                onChangeText={update("password")}
                error={errors.password}
                secure
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType={twoFactor ? "next" : "go"}
                onSubmitEditing={twoFactor ? undefined : submit}
            />

            {twoFactor && (
                <TextField
                    label="Código de verificación"
                    icon="key-outline"
                    placeholder="123456"
                    hint="Ábrelo en tu aplicación autenticadora."
                    value={form.twoFactorCode}
                    onChangeText={update("twoFactorCode")}
                    error={errors.twoFactorCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                />
            )}

            <Link href="/recuperar" style={styles.forgot}>
                <AppText variant="label" tone="primary">
                    ¿Olvidaste tu contraseña?
                </AppText>
            </Link>

            <Button title="Ingresar" icon="log-in-outline" onPress={submit} loading={sending} />

            {__DEV__ && (
                <Notice tone="info" title="Cuenta demo (solo en desarrollo)">
                    <View style={styles.demo}>
                        <AppText variant="caption" tone="soft" style={styles.demoText}>
                            {demoCredentials.email}
                        </AppText>
                        <Button title="Usar" size="sm" variant="secondary" onPress={fillDemo} />
                    </View>
                </Notice>
            )}
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 6,
        flexWrap: "wrap",
        justifyContent: "center"
    },
    forgot: {
        alignSelf: "flex-end"
    },
    demo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 4
    },
    demoText: {
        flex: 1
    }
})
