import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// Fila de menú con ícono, título, descripción opcional y flecha.
export function ListItem({ icon, title, description, onPress, disabled = false, trailing }) {
    const { colors, radius } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || !onPress}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            style={({ pressed }) => [styles.row, { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}
        >
            <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radius.sm }]}>
                <Ionicons name={icon} size={19} color={colors.primary} />
            </View>
            <View style={styles.text}>
                <AppText variant="label">{title}</AppText>
                {description && (
                    <AppText variant="caption" tone="muted">
                        {description}
                    </AppText>
                )}
            </View>
            {trailing ?? (onPress && !disabled ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null)}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10
    },
    icon: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        flex: 1,
        gap: 1
    }
})
