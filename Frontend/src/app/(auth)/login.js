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
import { api } from "../../api/client"
import { useToast } from "../../context/ToastContext"
import { useApiData } from "../../hooks/useApiData"
import { safeNext } from "../../lib/navigation"
import { fieldErrors } from "../../lib/validation"

// Cuentas demo creadas por "npm run seed". Solo en modo desarrollo: el backend las entrega con la contraseña
// de su .env (SEED_DEMO_PASSWORD), así la app nunca queda con una clave distinta a la del seed.
const loadDemoAccounts = ({ signal }) =>
    __DEV__
        ? api
              .get("/auth/demo-accounts", { signal, auth: false })
              .then((response) => response.data.accounts)
              .catch(() => [])
        : Promise.resolve([])

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
    // Cuenta creada pero sin verificar (ACC-02): se ofrece verificarla en vez de mostrar solo el error.
    const [pending, setPending] = useState(null)
    const demo = useApiData(loadDemoAccounts, [])
    const demoAccounts = demo.data ?? []

    if (user) return <Redirect href={next} />

    const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

    const changeMode = (value) => {
        setMode(value)
        setErrors({})
        setServerError(null)
    }

    const fillDemo = (account) => {
        setMode("email")
        setTwoFactor(false)
        setErrors({})
        setServerError(null)
        setPending(null)
        setForm({ identifier: account.email, password: account.password, twoFactorCode: "" })
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
        setPending(null)

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
            } else if (requestError.data?.requiresVerification) {
                setPending({ mode, identifier, channel: requestError.data.channel })
            } else {
                setServerError(requestError.message)
            }
        } finally {
            setSending(false)
        }
    }

    // Pide un código nuevo y abre la pantalla de verificación.
    const startVerification = async () => {
        const contact = pending.mode === "email" ? { email: pending.identifier } : { phone: pending.identifier }
        let sent = "1"

        try {
            await api.post("/auth/verify/resend", contact, { auth: false })
        } catch {
            // Si hay que esperar para reenviar, el código anterior sigue vigente: igual se abre la pantalla.
            sent = "0"
        }

        const key = pending.mode === "email" ? "email" : "phone"
        router.push(`/verificar?${key}=${encodeURIComponent(pending.identifier)}&sent=${sent}&next=${encodeURIComponent(next)}`)
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

            {pending && (
                <Notice tone="warning" title="Tu cuenta aún no está verificada">
                    <AppText variant="caption" tone="soft">
                        Para entrar, confirma tu {pending.channel === "phone" ? "teléfono con el código que te enviaremos por SMS" : "correo con el código que te enviaremos"}.
                    </AppText>
                    <View style={styles.pendingAction}>
                        <Button title="Verificar ahora" size="sm" icon="checkmark-circle-outline" onPress={startVerification} />
                    </View>
                </Notice>
            )}

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

            {demoAccounts.length > 0 && (
                <Notice tone="info" title="Cuentas demo (solo en desarrollo)">
                    {demoAccounts.map((account) => (
                        <View key={account.key} style={styles.demo}>
                            <View style={styles.demoText}>
                                <AppText variant="caption" weight="semibold">
                                    {account.label}
                                </AppText>
                                <AppText variant="caption" tone="soft">
                                    {account.email}
                                </AppText>
                            </View>
                            <Button
                                title="Usar"
                                size="sm"
                                variant="secondary"
                                onPress={() => fillDemo(account)}
                                accessibilityLabel={`Usar la cuenta demo de ${account.label.toLowerCase()}`}
                            />
                        </View>
                    ))}
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
    },
    pendingAction: {
        marginTop: 8,
        alignItems: "flex-start"
    }
})
