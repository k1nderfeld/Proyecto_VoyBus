import { Pressable, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { Logo } from "./Logo"
import { Screen } from "./Screen"
import { useTheme } from "../context/ThemeContext"

// Estructura común de las pantallas de acceso: volver, logo, título, formulario y pie.
export function AuthLayout({ title, description, children, footer }) {
    const { colors } = useTheme()

    const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"))

    return (
        <Screen edges={["top", "bottom"]} contentStyle={styles.content}>
            <View style={styles.header}>
                <Pressable
                    onPress={goBack}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </Pressable>
                <Logo size={36} />
            </View>

            <View style={styles.intro}>
                <AppText variant="title" accessibilityRole="header">
                    {title}
                </AppText>
                {description && <AppText tone="muted">{description}</AppText>}
            </View>

            <View style={styles.body}>{children}</View>

            {footer && <View style={styles.footer}>{footer}</View>}
        </Screen>
    )
}

const styles = StyleSheet.create({
    content: {
        gap: 24
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    back: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    intro: {
        gap: 6
    },
    body: {
        gap: 16
    },
    footer: {
        alignItems: "center",
        gap: 8,
        marginTop: "auto"
    }
})
