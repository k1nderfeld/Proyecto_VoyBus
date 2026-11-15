import { Pressable, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// Encabezado de las pantallas de detalle: botón volver, título y una acción opcional a la derecha.
export function ScreenHeader({ title, fallback = "/", action }) {
    const { colors } = useTheme()

    const goBack = () => (router.canGoBack() ? router.back() : router.replace(fallback))

    return (
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
            <AppText variant="label" tone="muted" style={styles.title} numberOfLines={1}>
                {title}
            </AppText>
            {action ?? <View style={styles.placeholder} />}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    back: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        flex: 1
    },
    placeholder: {
        width: 40
    }
})
