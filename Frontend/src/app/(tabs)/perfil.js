import { useState } from "react"
import { Image, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { AppText } from "../../components/AppText"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { ListItem } from "../../components/ListItem"
import { Screen } from "../../components/Screen"
import { EmptyState } from "../../components/States"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"
import { assetUrl } from "../../api/client"
import { confirmAction } from "../../lib/confirm"
import { initials } from "../../lib/format"

const roleLabels = {
    passenger: "Pasajero",
    driver: "Conductor",
    admin: "Administrador"
}

// Las secciones de la cuenta se completan en la rama feat/accountScreens (ACC-05, ACC-06 y ACC-07).
const accountSections = [
    { icon: "person-outline", title: "Mi perfil", description: "Nombre, alias, foto y correo" },
    { icon: "options-outline", title: "Preferencias", description: "Idioma, tema y notificaciones" },
    { icon: "shield-checkmark-outline", title: "Seguridad", description: "Cambiar contraseña" },
    { icon: "time-outline", title: "Historial de viajes", description: "Tus viajes y solicitudes de parada", passengerOnly: true }
]

export default function ProfileScreen() {
    const { colors } = useTheme()
    const { user, logout, isPassenger } = useAuth()
    const toast = useToast()
    const [leaving, setLeaving] = useState(false)

    if (!user) {
        return (
            <Screen>
                <AppText variant="title" accessibilityRole="header">
                    Perfil
                </AppText>
                <EmptyState
                    icon="person-circle-outline"
                    title="Aún no has iniciado sesión"
                    description="Puedes consultar líneas y paraderos sin cuenta. Inicia sesión para guardar favoritos y ver tu historial."
                    actionLabel="Iniciar sesión"
                    onAction={() => router.push("/login?next=/perfil")}
                />
                <Button title="Crear una cuenta" variant="ghost" onPress={() => router.push("/registro")} />
            </Screen>
        )
    }

    const signOut = async () => {
        const confirmed = await confirmAction({
            title: "Cerrar sesión",
            message: "¿Quieres cerrar tu sesión en este dispositivo?",
            confirmLabel: "Cerrar sesión",
            destructive: true
        })

        if (!confirmed) return

        setLeaving(true)
        await logout()
        setLeaving(false)
        toast.success("Cerraste tu sesión.")
    }

    const photo = assetUrl(user.photoUrl)

    return (
        <Screen>
            <AppText variant="title" accessibilityRole="header">
                Perfil
            </AppText>

            <Card>
                <View style={styles.identity}>
                    {photo ? (
                        <Image source={{ uri: photo }} style={styles.avatar} accessibilityLabel="Foto de perfil" />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <AppText variant="subtitle" tone="inverse">
                                {initials(user.name)}
                            </AppText>
                        </View>
                    )}
                    <View style={styles.identityText}>
                        <AppText variant="subtitle">{user.name}</AppText>
                        <AppText variant="caption" tone="muted">
                            {user.alias ? `@${user.alias} · ` : ""}
                            {user.email || user.phone}
                        </AppText>
                        <Badge label={roleLabels[user.role] ?? user.role} />
                    </View>
                </View>
            </Card>

            <Card style={styles.menu}>
                {accountSections
                    .filter((section) => !section.passengerOnly || isPassenger)
                    .map((section) => (
                        <ListItem
                            key={section.title}
                            icon={section.icon}
                            title={section.title}
                            description={`${section.description} · disponible pronto`}
                            disabled
                        />
                    ))}
            </Card>

            <Button title="Cerrar sesión" icon="log-out-outline" variant="danger" onPress={signOut} loading={leaving} />
        </Screen>
    )
}

const styles = StyleSheet.create({
    identity: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center"
    },
    identityText: {
        flex: 1,
        gap: 4
    },
    menu: {
        gap: 0,
        paddingVertical: 6
    }
})
