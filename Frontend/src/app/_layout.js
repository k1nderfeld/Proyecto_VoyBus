import { useEffect, useMemo } from "react"
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"
import * as SystemUI from "expo-system-ui"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
    useFonts,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold
} from "@expo-google-fonts/plus-jakarta-sans"
import { ThemeProvider, useTheme } from "../context/ThemeContext"
import { ToastProvider } from "../context/ToastContext"
import { AuthProvider, useAuth } from "../context/AuthContext"
import { FavoritesProvider } from "../context/FavoritesContext"
import { api } from "../api/client"

// La pantalla de inicio se mantiene hasta cargar las fuentes y recuperar la sesión guardada.
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold
    })

    // Si la fuente no carga, la app sigue con la fuente del sistema.
    if (!fontsLoaded && !fontError) return null

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <FavoritesProvider>
                            <AppStack />
                        </FavoritesProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    )
}

function AppStack() {
    const { colors, isDark, setMode } = useTheme()
    const { ready, user } = useAuth()
    const userId = user?.id

    useEffect(() => {
        if (ready) SplashScreen.hideAsync().catch(() => {})
    }, [ready])

    // Al iniciar sesión se aplica el tema guardado en la cuenta (ACC-06), aunque se haya elegido en otro teléfono.
    useEffect(() => {
        if (!userId) return undefined

        let active = true

        api.get("/users/me/preferences")
            .then((response) => {
                if (active && response.data?.theme) setMode(response.data.theme)
            })
            .catch(() => {})

        return () => {
            active = false
        }
    }, [userId, setMode])

    // La ventana nativa del teléfono queda con el fondo de la app. Si no, durante una transición
    // o mientras carga una pantalla se ve su color por defecto (blanco), como un destello.
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.background).catch(() => {})
    }, [colors.background])

    // La navegación usa su propio tema; si no se le pasan los colores de la app, usa fondos claros por defecto.
    const navigationTheme = useMemo(() => {
        const base = isDark ? DarkTheme : DefaultTheme

        return {
            ...base,
            colors: {
                ...base.colors,
                primary: colors.primary,
                background: colors.background,
                card: colors.surface,
                text: colors.text,
                border: colors.border,
                notification: colors.danger
            }
        }
    }, [isDark, colors])

    if (!ready) return null

    return (
        <NavigationThemeProvider value={navigationTheme}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: "slide_from_right"
                }}
            />
        </NavigationThemeProvider>
    )
}
