import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// Selector de opciones en una fila (por ejemplo "Correo" o "Teléfono").
export function Segmented({ options, value, onChange, accessibilityLabel }) {
    const { colors, radius } = useTheme()

    return (
        <View
            accessibilityRole="tablist"
            accessibilityLabel={accessibilityLabel}
            style={[styles.group, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}
        >
            {options.map((option) => {
                const selected = option.value === value

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        accessibilityRole="tab"
                        accessibilityLabel={option.label}
                        accessibilityState={{ selected }}
                        style={[
                            styles.option,
                            {
                                borderRadius: radius.sm,
                                backgroundColor: selected ? colors.surface : "transparent",
                                shadowColor: colors.shadow,
                                shadowOpacity: selected ? 0.08 : 0,
                                elevation: selected ? 2 : 0
                            }
                        ]}
                    >
                        {option.icon && (
                            <Ionicons name={option.icon} size={16} color={selected ? colors.primary : colors.muted} />
                        )}
                        <AppText variant="label" tone={selected ? "primary" : "muted"}>
                            {option.label}
                        </AppText>
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        flexDirection: "row",
        padding: 4,
        gap: 4
    },
    option: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minHeight: 42,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }
    }
})
