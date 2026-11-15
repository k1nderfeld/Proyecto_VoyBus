import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"

const tabIcon = (name) =>
    function TabIcon({ color, focused, size }) {
        return <Ionicons name={focused ? name : `${name}-outline`} size={size ?? 22} color={color} />
    }

export default function TabsLayout() {
    const { colors, fonts } = useTheme()
    const { user } = useAuth()

    // Favoritos es solo para pasajeros: se oculta a conductores y administradores.
    const hideFavorites = Boolean(user) && user.role !== "passenger"

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
                sceneStyle: { backgroundColor: colors.background }
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: tabIcon("home") }} />
            <Tabs.Screen name="lineas" options={{ title: "Líneas", tabBarIcon: tabIcon("bus") }} />
            <Tabs.Screen name="paraderos" options={{ title: "Paraderos", tabBarIcon: tabIcon("location") }} />
            <Tabs.Screen
                name="favoritos"
                options={{ title: "Favoritos", tabBarIcon: tabIcon("heart"), href: hideFavorites ? null : undefined }}
            />
            <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: tabIcon("person-circle") }} />
        </Tabs>
    )
}
