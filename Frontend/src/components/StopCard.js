import { Pressable, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { Card } from "./Card"
import { FavoriteButton } from "./FavoriteButton"
import { LineBadge } from "./LineBadge"
import { useTheme } from "../context/ThemeContext"

// Paradero en un listado: código, nombre y líneas que pasan (RED-02).
// El área que abre el detalle y el botón de favorito son controles separados (no anidados).
export function StopCard({ stop }) {
    const { colors } = useTheme()
    const lineCodes = stop.lines?.map((line) => line.code).join(", ")

    return (
        <Card style={styles.card}>
            <Pressable
                onPress={() => router.push(`/paraderos/${stop.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Paradero ${stop.name}, código ${stop.code}${lineCodes ? `, líneas ${lineCodes}` : ""}`}
                accessibilityHint="Abre el detalle del paradero"
                style={({ pressed }) => [styles.main, { opacity: pressed ? 0.8 : 1 }]}
            >
                <View style={styles.header}>
                    <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.title}>
                        <AppText variant="label" numberOfLines={2}>
                            {stop.name}
                        </AppText>
                        <AppText variant="caption" tone="muted">
                            {stop.code}
                        </AppText>
                    </View>
                </View>

                {stop.lines && (
                    <View style={styles.lines}>
                        {stop.lines.length ? (
                            stop.lines.map((line) => <LineBadge key={line.id} code={line.code} color={line.color} size="sm" />)
                        ) : (
                            <AppText variant="caption" tone="muted">
                                Sin líneas en servicio por ahora
                            </AppText>
                        )}
                    </View>
                )}
            </Pressable>
            <FavoriteButton type="stops" item={stop} />
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
        alignItems: "center",
        gap: 12
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        flex: 1,
        gap: 1
    },
    lines: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6
    }
})
