import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"
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
    const { colors, isDark } = useTheme()
    const { ready } = useAuth()

    useEffect(() => {
        if (ready) SplashScreen.hideAsync().catch(() => {})
    }, [ready])

    if (!ready) return null

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: "slide_from_right"
                }}
            />
        </>
    )
}
