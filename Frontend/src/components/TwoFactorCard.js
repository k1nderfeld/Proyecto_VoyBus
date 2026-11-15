import { useState } from "react"
import { Image, Linking, StyleSheet, View } from "react-native"
import * as Clipboard from "expo-clipboard"
import { AppText } from "./AppText"
import { Badge } from "./Badge"
import { Button } from "./Button"
import { Card } from "./Card"
import { Notice } from "./States"
import { TextField } from "./TextField"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"
import { api } from "../api/client"
import { fieldErrors } from "../lib/validation"

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6)

// Verificación en dos pasos con una aplicación autenticadora (ACC-01):
// generar la clave y su QR, confirmar con un código para activarla, y desactivarla con contraseña y código.
export function TwoFactorCard() {
    const { user, updateUser } = useAuth()
    const { colors, radius } = useTheme()
    const toast = useToast()

    const [setup, setSetup] = useState(null)
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [disabling, setDisabling] = useState(false)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [busy, setBusy] = useState(false)

    const reset = () => {
        setSetup(null)
        setDisabling(false)
        setCode("")
        setPassword("")
        setErrors({})
        setServerError(null)
    }

    const run = async (action) => {
        setBusy(true)
        setErrors({})
        setServerError(null)

        try {
            await action()
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            setErrors(fields)
            if (!Object.keys(fields).length) setServerError(requestError.message)
        } finally {
            setBusy(false)
        }
    }

    const startSetup = () =>
        run(async () => {
            const response = await api.post("/auth/2fa/setup")
            setSetup(response.data)
        })

    const enable = () => {
        if (code.length !== 6) {
            setErrors({ code: "Ingresa los 6 dígitos que muestra tu aplicación." })
            return
        }

        run(async () => {
            const response = await api.post("/auth/2fa/enable", { code })
            updateUser(response.data)
            toast.success(response.message)
            reset()
        })
    }

    const disable = () => {
        const nextErrors = {}
        if (!password) nextErrors.currentPassword = "Ingresa tu contraseña actual."
        if (code.length !== 6) nextErrors.code = "Ingresa los 6 dígitos que muestra tu aplicación."

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        run(async () => {
            const response = await api.post("/auth/2fa/disable", { currentPassword: password, code })
            updateUser(response.data)
            toast.success(response.message)
            reset()
        })
    }

    const copySecret = async () => {
        await Clipboard.setStringAsync(setup.secret)
        toast.success("Clave copiada.")
    }

    // En el mismo teléfono no se puede escanear el QR: el enlace otpauth:// abre directo la app autenticadora.
    const openAuthenticator = () =>
        Linking.openURL(setup.otpauthUrl).catch(() =>
            toast.error("No encontramos una aplicación autenticadora. Instala una (por ejemplo Google Authenticator) o copia la clave.")
        )

    const codeField = (
        <TextField
            label="Código de 6 dígitos"
            icon="keypad-outline"
            placeholder="123456"
            value={code}
            onChangeText={(value) => setCode(onlyDigits(value))}
            error={errors.code}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
        />
    )

    return (
        <Card>
            <View style={styles.row}>
                <AppText variant="subtitle" style={styles.flex}>
                    Verificación en dos pasos
                </AppText>
                <Badge label={user.twoFactorEnabled ? "Activada" : "Desactivada"} tone={user.twoFactorEnabled ? "success" : "neutral"} />
            </View>
            <AppText variant="caption" tone="muted">
                Al iniciar sesión, además de tu contraseña se pedirá un código de una aplicación autenticadora
                (Google Authenticator, Microsoft Authenticator u otra).
            </AppText>

            {serverError && <Notice tone="danger">{serverError}</Notice>}

            {!user.twoFactorEnabled && !setup && (
                <Button title="Activar" icon="shield-checkmark-outline" onPress={startSetup} loading={busy} />
            )}

            {!user.twoFactorEnabled && setup && (
                <View style={styles.steps}>
                    <AppText variant="label">1. Agrega VoyBus a tu aplicación autenticadora</AppText>
                    <AppText variant="caption" tone="muted">
                        Escanea el código desde otro dispositivo o, si la aplicación está en este teléfono, ábrela con el botón o copia la clave.
                    </AppText>
                    <View style={[styles.qrBox, { backgroundColor: "#FFFFFF", borderRadius: radius.md, borderColor: colors.border }]}>
                        <Image source={{ uri: setup.qrCode }} style={styles.qr} accessibilityLabel="Código QR para la aplicación autenticadora" />
                    </View>
                    <View style={[styles.secret, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                        <AppText variant="caption" tone="muted">
                            Clave
                        </AppText>
                        <AppText variant="label" selectable style={styles.secretText}>
                            {setup.secret.match(/.{1,4}/g).join(" ")}
                        </AppText>
                    </View>
                    <View style={styles.actions}>
                        <Button title="Abrir la app" icon="open-outline" variant="secondary" size="sm" onPress={openAuthenticator} style={styles.grow} />
                        <Button title="Copiar clave" icon="copy-outline" variant="secondary" size="sm" onPress={copySecret} style={styles.grow} />
                    </View>

                    <AppText variant="label">2. Ingresa el código que muestra la aplicación</AppText>
                    {codeField}
                    <View style={styles.actions}>
                        <Button title="Confirmar y activar" onPress={enable} loading={busy} style={styles.grow} />
                        <Button title="Cancelar" variant="secondary" onPress={reset} disabled={busy} style={styles.grow} />
                    </View>
                </View>
            )}

            {user.twoFactorEnabled && !disabling && (
                <Button title="Desactivar" variant="danger" onPress={() => setDisabling(true)} />
            )}

            {user.twoFactorEnabled && disabling && (
                <View style={styles.steps}>
                    <AppText variant="caption" tone="muted">
                        Para desactivarla, confirma tu contraseña y un código de la aplicación.
                    </AppText>
                    <TextField
                        label="Tu contraseña"
                        icon="lock-closed-outline"
                        value={password}
                        onChangeText={setPassword}
                        error={errors.currentPassword}
                        secure
                        autoCapitalize="none"
                    />
                    {codeField}
                    <View style={styles.actions}>
                        <Button title="Desactivar" variant="danger" onPress={disable} loading={busy} style={styles.grow} />
                        <Button title="Cancelar" variant="secondary" onPress={reset} disabled={busy} style={styles.grow} />
                    </View>
                </View>
            )}
        </Card>
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
    },
    steps: {
        gap: 10
    },
    qrBox: {
        alignSelf: "center",
        padding: 10,
        borderWidth: 1
    },
    qr: {
        width: 200,
        height: 200
    },
    secret: {
        padding: 12,
        gap: 2
    },
    secretText: {
        letterSpacing: 1
    },
    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },
    grow: {
        flexGrow: 1
    }
})
