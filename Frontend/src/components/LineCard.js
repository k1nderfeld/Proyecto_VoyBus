import { Pressable, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { Badge } from "./Badge"
import { Card } from "./Card"
import { FavoriteButton } from "./FavoriteButton"
import { LineBadge } from "./LineBadge"
import { useTheme } from "../context/ThemeContext"
import { statusLabel, statusTone } from "../lib/labels"

// Línea en un listado: código, nombre, inicio y término, estado y botón de favorito (RED-01).
// El área que abre el detalle y el botón de favorito son controles separados (no anidados) para los lectores de pantalla.
export function LineCard({ line }) {
    const { colors } = useTheme()

    return (
        <Card style={styles.card}>
            <Pressable
                onPress={() => router.push(`/lineas/${line.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Línea ${line.code}, ${line.name}, ${statusLabel(line)}`}
                accessibilityHint="Abre los recorridos de la línea"
                style={({ pressed }) => [styles.main, { opacity: pressed ? 0.8 : 1 }]}
            >
                <View style={styles.header}>
                    <LineBadge code={line.code} color={line.color} />
                    <View style={styles.title}>
                        <AppText variant="subtitle" numberOfLines={2}>
                            {line.name}
                        </AppText>
                        <Badge label={statusLabel(line)} tone={statusTone(line.status)} />
                    </View>
                </View>

                {line.origin && line.destination && (
                    <View style={styles.route}>
                        <Ionicons name="navigate-circle-outline" size={18} color={colors.muted} />
                        <AppText variant="caption" tone="soft" style={styles.flex} numberOfLines={2}>
                            {line.origin.name} → {line.destination.name}
                        </AppText>
                    </View>
                )}

                {line.notice && (
                    <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning} />
                        <AppText variant="caption" tone="warning" style={styles.flex}>
                            {line.notice}
                        </AppText>
                    </View>
                )}
            </Pressable>
            <FavoriteButton type="lines" item={line} />
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    main: {
        flex: 1,
        gap: 12
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12
    },
    title: {
        flex: 1,
        gap: 6
    },
    route: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    flex: {
        flex: 1
    },
    notice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 10,
        borderRadius: 10
    }
})
