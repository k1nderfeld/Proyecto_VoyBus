import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// variant: primary (acción principal), secondary, ghost (enlace) o danger.
export function Button({
    title,
    onPress,
    variant = "primary",
    icon,
    loading = false,
    disabled = false,
    size = "md",
    style,
    accessibilityLabel
}) {
    const { colors, radius } = useTheme()
    const inactive = disabled || loading

    const palette = {
        primary: { background: colors.primary, text: colors.onPrimary, border: colors.primary },
        secondary: { background: colors.surface, text: colors.primary, border: colors.borderStrong },
        ghost: { background: "transparent", text: colors.primary, border: "transparent" },
        danger: { background: colors.dangerSoft, text: colors.danger, border: colors.dangerSoft }
    }[variant]

    const height = size === "sm" ? 40 : 52

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{ disabled: inactive, busy: loading }}
            style={({ pressed }) => [
                styles.button,
                {
                    minHeight: height,
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    borderRadius: radius.md,
                    paddingHorizontal: variant === "ghost" ? 8 : 18,
                    opacity: inactive ? 0.55 : pressed ? 0.85 : 1
                },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={palette.text} />
            ) : (
                <View style={styles.content}>
                    {icon && <Ionicons name={icon} size={size === "sm" ? 16 : 19} color={palette.text} />}
                    <AppText variant="label" weight="bold" style={{ color: palette.text }}>
                        {title}
                    </AppText>
                </View>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    }
})
