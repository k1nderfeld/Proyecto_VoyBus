import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../context/ThemeContext"

// Contenedor de cada pantalla: respeta el notch, evita que el teclado tape los campos
// y, con onRefresh, permite actualizar deslizando hacia abajo.
export function Screen({
    children,
    scroll = true,
    edges = ["top"],
    contentStyle,
    refreshing = false,
    onRefresh,
    keyboardShouldPersistTaps = "handled"
}) {
    const { colors, spacing } = useTheme()

    const content = scroll ? (
        <ScrollView
            contentContainerStyle={[styles.content, { padding: spacing.lg, paddingBottom: spacing.xxl }, contentStyle]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            refreshControl={
                onRefresh ? (
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                ) : undefined
            }
        >
            {children}
        </ScrollView>
    ) : (
        <View style={[styles.fill, { padding: spacing.lg }, contentStyle]}>{children}</View>
    )

    return (
        <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {content}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    content: {
        flexGrow: 1,
        gap: 16,
        width: "100%",
        maxWidth: 640,
        alignSelf: "center"
    }
})
