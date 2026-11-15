import { Pressable, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// Paraderos de un recorrido en el orden en que los recorre el servicio (RED-01).
export function RouteStopList({ stops, color }) {
    const { colors } = useTheme()

    return (
        <View accessibilityLabel="Paraderos del recorrido en orden">
            {stops.map((stop, index) => {
                const edge = index === 0 || index === stops.length - 1

                return (
                    <Pressable
                        key={stop.id}
                        onPress={() => router.push(`/paraderos/${stop.id}`)}
                        accessibilityRole="button"
                        accessibilityLabel={`Paradero ${stop.order}: ${stop.name}`}
                        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
                    >
                        <View style={styles.rail}>
                            <View
                                style={[
                                    styles.line,
                                    { backgroundColor: index === 0 ? "transparent" : color }
                                ]}
                            />
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        borderColor: color,
                                        backgroundColor: edge ? color : colors.surface
                                    }
                                ]}
                            >
                                <AppText variant="caption" weight="bold" style={{ color: edge ? "#FFFFFF" : colors.text, fontSize: 11 }}>
                                    {stop.order}
                                </AppText>
                            </View>
                            <View
                                style={[
                                    styles.line,
                                    { backgroundColor: index === stops.length - 1 ? "transparent" : color }
                                ]}
                            />
                        </View>
                        <View style={styles.text}>
                            <AppText variant="label">{stop.name}</AppText>
                            <AppText variant="caption" tone="muted">
                                {stop.code}
                            </AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 58
    },
    rail: {
        width: 28,
        alignItems: "center",
        alignSelf: "stretch"
    },
    line: {
        width: 3,
        flex: 1
    },
    dot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        flex: 1,
        gap: 1
    }
})
