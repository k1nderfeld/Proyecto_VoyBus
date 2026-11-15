import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../components/AppText"
import { useTheme } from "./ThemeContext"

const ToastContext = createContext(null)

const DURATION_MS = 3500

const tones = {
    success: { icon: "checkmark-circle", color: "success", background: "successSoft" },
    error: { icon: "alert-circle", color: "danger", background: "dangerSoft" },
    info: { icon: "information-circle", color: "primary", background: "primarySoft" }
}

// Avisos breves que no bloquean la pantalla (por ejemplo "Sesión iniciada correctamente").
export function ToastProvider({ children }) {
    const { colors, spacing, radius } = useTheme()
    const insets = useSafeAreaInsets()
    const [toast, setToast] = useState(null)
    const [opacity] = useState(() => new Animated.Value(0))
    const timer = useRef(null)

    const hide = useCallback(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== "web" }).start(() => setToast(null))
    }, [opacity])

    const show = useCallback(
        (type, message) => {
            if (!message) return
            clearTimeout(timer.current)
            setToast({ type, message, id: Date.now() })
            Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== "web" }).start()
            timer.current = setTimeout(hide, DURATION_MS)
        },
        [hide, opacity]
    )

    const value = useMemo(
        () => ({
            success: (message) => show("success", message),
            error: (message) => show("error", message),
            info: (message) => show("info", message)
        }),
        [show]
    )

    const tone = toast ? tones[toast.type] : null

    return (
        <ToastContext.Provider value={value}>
            {children}
            {toast && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[styles.wrapper, { top: insets.top + spacing.sm, opacity }]}
                >
                    <Pressable
                        onPress={hide}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="polite"
                        style={[
                            styles.toast,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderRadius: radius.md,
                                shadowColor: colors.shadow
                            }
                        ]}
                    >
                        <View style={[styles.icon, { backgroundColor: colors[tone.background] }]}>
                            <Ionicons name={tone.icon} size={18} color={colors[tone.color]} />
                        </View>
                        <AppText style={styles.message}>{toast.message}</AppText>
                    </Pressable>
                </Animated.View>
            )}
        </ToastContext.Provider>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        alignItems: "center",
        zIndex: 1000
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        maxWidth: 520,
        width: "100%",
        shadowOpacity: 0.16,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6
    },
    icon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center"
    },
    message: {
        flex: 1
    }
})

export const useToast = () => useContext(ToastContext)
