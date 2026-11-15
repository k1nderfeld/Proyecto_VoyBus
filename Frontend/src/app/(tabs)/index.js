import { StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../../components/AppText"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { Logo } from "../../components/Logo"
import { Screen } from "../../components/Screen"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { greeting } from "../../lib/format"

const shortcuts = [
    {
        href: "/lineas",
        icon: "bus",
        title: "Líneas y recorridos",
        description: "Busca una línea y revisa sus recorridos, horarios y paraderos."
    },
    {
        href: "/paraderos",
        icon: "location",
        title: "Paraderos",
        description: "Encuentra paraderos en el mapa y las líneas que pasan por ellos."
    }
]

export default function HomeScreen() {
    const { colors } = useTheme()
    const { user } = useAuth()
    const firstName = user?.alias || user?.name?.split(" ")[0]

    return (
        <Screen>
            <Logo size={34} />

            <View style={styles.intro}>
                <AppText variant="overline" tone="primary">
                    {greeting()}
                </AppText>
                <AppText variant="display" accessibilityRole="header">
                    {firstName ? `Hola, ${firstName}` : "Tu ciudad, a un viaje de distancia"}
                </AppText>
                <AppText tone="muted">Consulta el transporte público de Antofagasta desde tu teléfono.</AppText>
            </View>

            {shortcuts.map((shortcut) => (
                <Card key={shortcut.href} onPress={() => router.push(shortcut.href)} accessibilityLabel={shortcut.title}>
                    <View style={styles.shortcut}>
                        <View style={[styles.shortcutIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name={shortcut.icon} size={22} color={colors.primary} />
                        </View>
                        <View style={styles.shortcutText}>
                            <AppText variant="subtitle">{shortcut.title}</AppText>
                            <AppText variant="caption" tone="muted">
                                {shortcut.description}
                            </AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                    </View>
                </Card>
            ))}

            {!user && (
                <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
                    <AppText variant="subtitle">Guarda tus líneas y paraderos</AppText>
                    <AppText tone="soft">
                        Con una cuenta puedes guardar favoritos y revisar el historial de tus viajes.
                    </AppText>
                    <View style={styles.actions}>
                        <Button title="Crear cuenta" onPress={() => router.push("/registro")} style={styles.action} />
                        <Button
                            title="Iniciar sesión"
                            variant="secondary"
                            onPress={() => router.push("/login")}
                            style={styles.action}
                        />
                    </View>
                </Card>
            )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    intro: {
        gap: 6,
        marginTop: 8
    },
    shortcut: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    shortcutIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center"
    },
    shortcutText: {
        flex: 1,
        gap: 2
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap"
    },
    action: {
        flexGrow: 1
    }
})
