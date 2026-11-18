import { Pressable, StyleSheet, View } from "react-native"
import { useTheme } from "../context/ThemeContext"

// Tarjeta con el fondo y borde del tema. Con onPress se comporta como botón.
export function Card({ children, onPress, style, accessibilityLabel }) {
    const { colors, radius, spacing } = useTheme()

    const base = [
        styles.card,
        {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            shadowColor: colors.shadow
        },
        style
    ]

    if (!onPress) return <View style={base}>{children}</View>

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}
        >
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        gap: 12,
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 1
    }
})
