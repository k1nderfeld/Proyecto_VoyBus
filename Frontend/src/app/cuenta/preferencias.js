import { useState } from "react"
import { Linking, Platform, StyleSheet, Switch, View } from "react-native"
import { AppText } from "../../components/AppText"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { RequireAuth } from "../../components/RequireAuth"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { Segmented } from "../../components/Segmented"
import { ErrorState, Loader, Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"
import { useApiData } from "../../hooks/useApiData"
import { api } from "../../api/client"

// "notifications.nextStop" -> valores.notifications.nextStop
const readPath = (values, path) => path.split(".").reduce((current, key) => current?.[key], values)

// "notifications.nextStop" + true -> { notifications: { nextStop: true } }, el formato que espera el backend.
const bodyFor = (path, value) => {
    const [first, second] = path.split(".")
    return second ? { [first]: { [second]: value } } : { [first]: value }
}

const optionIcons = { light: "sunny-outline", dark: "moon-outline", system: "phone-portrait-outline" }

// Preferencias de cuenta (ACC-06). Las opciones vienen del backend, así que solo se puede elegir lo que la app soporta.
// Cada cambio se guarda al instante y el tema se aplica de inmediato.
export default function PreferencesScreen() {
    return (
        <RequireAuth title="Preferencias">
            <PreferencesContent />
        </RequireAuth>
    )
}

function PreferencesContent() {
    const { setMode } = useTheme()
    const toast = useToast()
    const [overrides, setOverrides] = useState({})
    const [status, setStatus] = useState(null)

    const data = useApiData(
        ({ signal }) =>
            Promise.all([
                api.get("/users/preferences/options", { signal, auth: false }),
                api.get("/users/me/preferences", { signal })
            ]).then(([options, preferences]) => ({ groups: options.data, values: preferences.data })),
        []
    )

    if (data.loading && !data.data) {
        return (
            <Screen>
                <ScreenHeader title="Preferencias" fallback="/perfil" />
                <Loader label="Cargando preferencias" />
            </Screen>
        )
    }

    if (data.error || !data.data) {
        return (
            <Screen>
                <ScreenHeader title="Preferencias" fallback="/perfil" />
                <ErrorState message={data.error} onRetry={data.reload} />
            </Screen>
        )
    }

    const valueOf = (path) => (path in overrides ? overrides[path] : readPath(data.data.values, path))

    const change = async (preference, value) => {
        const previous = valueOf(preference.path)
        if (previous === value) return

        setOverrides((current) => ({ ...current, [preference.path]: value }))
        if (preference.path === "theme") setMode(value)
        setStatus("saving")

        try {
            await api.patch("/users/me/preferences", bodyFor(preference.path, value))
            setStatus("saved")
        } catch (requestError) {
            setOverrides((current) => ({ ...current, [preference.path]: previous }))
            if (preference.path === "theme") setMode(previous)
            setStatus(null)
            toast.error(requestError.message)
        }
    }

    return (
        <Screen>
            <ScreenHeader title="Preferencias" fallback="/perfil" />

            <View style={styles.intro}>
                <AppText variant="title" accessibilityRole="header">
                    Preferencias
                </AppText>
                <AppText variant="caption" tone="muted" accessibilityLiveRegion="polite">
                    {status === "saving"
                        ? "Guardando…"
                        : status === "saved"
                            ? "Cambios guardados en tu cuenta."
                            : "Los cambios se guardan automáticamente."}
                </AppText>
            </View>

            {data.data.groups.map((group) => (
                <Card key={group.key}>
                    <View style={styles.groupHeader}>
                        <AppText variant="subtitle">{group.label}</AppText>
                        {group.description && (
                            <AppText variant="caption" tone="muted">
                                {group.description}
                            </AppText>
                        )}
                    </View>

                    {group.preferences.map((preference) => (
                        <PreferenceRow
                            key={preference.path}
                            preference={preference}
                            value={valueOf(preference.path)}
                            onChange={(value) => change(preference, value)}
                        />
                    ))}

                    {group.key === "general" && valueOf("language") !== "es" && (
                        <Notice tone="info">
                            Por ahora la app está disponible solo en español. Guardamos tu elección para cuando esté la traducción.
                        </Notice>
                    )}

                    {group.key === "notifications" && <NotificationsHelp />}
                </Card>
            ))}
        </Screen>
    )
}

function PreferenceRow({ preference, value, onChange }) {
    const { colors } = useTheme()

    if (preference.type === "enum") {
        return (
            <View style={styles.enumRow}>
                <AppText variant="label">{preference.label}</AppText>
                <AppText variant="caption" tone="muted">
                    {preference.description}
                </AppText>
                <Segmented
                    options={preference.options.map((option) => ({
                        value: option.value,
                        label: option.label,
                        icon: optionIcons[option.value]
                    }))}
                    value={value}
                    onChange={onChange}
                    accessibilityLabel={preference.label}
                />
            </View>
        )
    }

    return (
        <View style={styles.switchRow}>
            <View style={styles.flex}>
                <AppText variant="label">{preference.label}</AppText>
                <AppText variant="caption" tone="muted">
                    {preference.description}
                </AppText>
            </View>
            <Switch
                value={Boolean(value)}
                onValueChange={onChange}
                accessibilityLabel={preference.label}
                trackColor={{ true: colors.primary, false: colors.borderStrong }}
                thumbColor={colors.surface}
            />
        </View>
    )
}

// Si el teléfono bloquea las notificaciones, se explica cómo activarlas (ACC-06).
function NotificationsHelp() {
    return (
        <Notice tone="info" title="¿No te llegan los avisos?">
            <AppText variant="caption" tone="soft">
                Revisa que el teléfono permita las notificaciones de la app: en Ajustes, entra a Aplicaciones (o
                Notificaciones en iPhone), busca la app y activa las notificaciones.
            </AppText>
            {Platform.OS !== "web" && (
                <View style={styles.helpAction}>
                    <Button
                        title="Abrir ajustes del teléfono"
                        size="sm"
                        variant="secondary"
                        icon="settings-outline"
                        onPress={() => Linking.openSettings()}
                    />
                </View>
            )}
        </Notice>
    )
}

const styles = StyleSheet.create({
    intro: {
        gap: 4
    },
    groupHeader: {
        gap: 2
    },
    enumRow: {
        gap: 6
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4
    },
    flex: {
        flex: 1,
        gap: 2
    },
    helpAction: {
        marginTop: 8,
        alignItems: "flex-start"
    }
})
