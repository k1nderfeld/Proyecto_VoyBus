import { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet } from "react-native"
import { router, usePathname } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../context/FavoritesContext"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"

// Guardar o quitar una línea o paradero de favoritos (solo pasajeros, ACC-05 y RED-02).
// Para invitados lleva a iniciar sesión; a conductores y administradores no se les muestra.
export function FavoriteButton({ type, item, size = 22 }) {
    const { colors, radius } = useTheme()
    const { user, isPassenger } = useAuth()
    const { isFavorite, toggle } = useFavorites()
    const toast = useToast()
    const pathname = usePathname()
    const [busy, setBusy] = useState(false)

    if (user && !isPassenger) return null

    const active = isFavorite(type, item.id)
    const noun = type === "lines" ? `la línea ${item.code}` : `el paradero ${item.name}`

    const press = async () => {
        if (!user) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`)
            return
        }

        setBusy(true)

        try {
            const saved = await toggle(type, item)
            toast.success(saved ? "Guardado en tus favoritos." : "Quitado de tus favoritos.")
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Pressable
            onPress={press}
            disabled={busy}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: active, busy }}
            accessibilityLabel={active ? `Quitar ${noun} de favoritos` : `Guardar ${noun} en favoritos`}
            style={({ pressed }) => [
                styles.button,
                {
                    borderRadius: radius.pill,
                    backgroundColor: active ? colors.primarySoft : colors.surfaceAlt,
                    opacity: pressed ? 0.75 : 1
                }
            ]}
        >
            {busy ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : (
                <Ionicons name={active ? "heart" : "heart-outline"} size={size} color={active ? colors.primary : colors.muted} />
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center"
    }
})
