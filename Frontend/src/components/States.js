import { ActivityIndicator, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { Button } from "./Button"
import { useTheme } from "../context/ThemeContext"

// Estados de carga, vacío y error visibles en todas las pantallas (RNF-02).

export function Loader({ label = "Cargando" }) {
    const { colors } = useTheme()

    return (
        <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="caption" tone="muted">
                {label}
            </AppText>
        </View>
    )
}

export function EmptyState({ icon = "file-tray-outline", title, description, actionLabel, onAction }) {
    const { colors } = useTheme()

    return (
        <View style={styles.center}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name={icon} size={28} color={colors.primary} />
            </View>
            <AppText variant="subtitle" align="center">
                {title}
            </AppText>
            {description && (
                <AppText tone="muted" align="center">
                    {description}
                </AppText>
            )}
            {actionLabel && <Button title={actionLabel} onPress={onAction} variant="secondary" />}
        </View>
    )
}

export function ErrorState({ message, onRetry }) {
    const { colors } = useTheme()

    return (
        <View style={styles.center} accessibilityRole="alert">
            <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
            </View>
            <AppText variant="subtitle" align="center">
                Algo salió mal
            </AppText>
            <AppText tone="muted" align="center">
                {message || "No se pudo cargar la información."}
            </AppText>
            {onRetry && <Button title="Reintentar" icon="refresh" onPress={onRetry} variant="secondary" />}
        </View>
    )
}

const noticeTones = {
    info: { icon: "information-circle-outline", color: "primary", background: "primarySoft" },
    success: { icon: "checkmark-circle-outline", color: "success", background: "successSoft" },
    warning: { icon: "warning-outline", color: "warning", background: "warningSoft" },
    danger: { icon: "alert-circle-outline", color: "danger", background: "dangerSoft" }
}

// Aviso dentro de la pantalla (por ejemplo un error del servidor o una línea suspendida).
export function Notice({ tone = "info", title, children }) {
    const { colors, radius } = useTheme()
    const config = noticeTones[tone]

    return (
        <View
            accessibilityRole={tone === "danger" ? "alert" : undefined}
            style={[styles.notice, { backgroundColor: colors[config.background], borderRadius: radius.md }]}
        >
            <Ionicons name={config.icon} size={20} color={colors[config.color]} />
            <View style={styles.noticeText}>
                {title && (
                    <AppText variant="label" style={{ color: colors[config.color] }}>
                        {title}
                    </AppText>
                )}
                {typeof children === "string" ? (
                    <AppText variant="caption" tone="soft">
                        {children}
                    </AppText>
                ) : (
                    children
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 32,
        paddingHorizontal: 16
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center"
    },
    notice: {
        flexDirection: "row",
        gap: 10,
        padding: 14,
        alignItems: "flex-start"
    },
    noticeText: {
        flex: 1,
        gap: 2
    }
})
