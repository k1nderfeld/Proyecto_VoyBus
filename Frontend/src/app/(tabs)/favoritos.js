import { useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { LineCard } from "../../components/LineCard"
import { Screen } from "../../components/Screen"
import { Segmented } from "../../components/Segmented"
import { StopCard } from "../../components/StopCard"
import { EmptyState, ErrorState, Loader } from "../../components/States"
import { useAuth } from "../../context/AuthContext"
import { useFavorites } from "../../context/FavoritesContext"
import { useTheme } from "../../context/ThemeContext"

// Favoritos del pasajero (ACC-05): consultar y quitar líneas y paraderos guardados.
// Se muestran también los que fueron desactivados, para que se puedan quitar.
export default function FavoritesScreen() {
    const { user } = useAuth()

    if (!user) {
        return (
            <Screen>
                <AppText variant="title" accessibilityRole="header">
                    Favoritos
                </AppText>
                <EmptyState
                    icon="heart-outline"
                    title="Inicia sesión para guardar favoritos"
                    description="Guarda las líneas y paraderos que más usas para encontrarlos rápido."
                    actionLabel="Iniciar sesión"
                    onAction={() => router.push("/login?next=/favoritos")}
                />
            </Screen>
        )
    }

    return <FavoritesList />
}

function FavoritesList() {
    const { colors, spacing } = useTheme()
    const favorites = useFavorites()
    const [type, setType] = useState("lines")

    const items = type === "lines" ? favorites.lines : favorites.stops
    const tabs = [
        { value: "lines", label: `Líneas (${favorites.lines.length})`, icon: "bus-outline" },
        { value: "stops", label: `Paraderos (${favorites.stops.length})`, icon: "location-outline" }
    ]

    let content
    if (favorites.loading && !items.length) content = <Loader label="Cargando favoritos" />
    else if (favorites.error && !items.length) content = <ErrorState message={favorites.error} onRetry={favorites.refresh} />
    else if (!items.length) {
        content = (
            <EmptyState
                icon={type === "lines" ? "bus-outline" : "location-outline"}
                title={type === "lines" ? "Aún no guardas líneas" : "Aún no guardas paraderos"}
                description="Toca el corazón en una línea o un paradero para guardarlo aquí."
                actionLabel={type === "lines" ? "Explorar líneas" : "Ver paraderos"}
                onAction={() => router.push(type === "lines" ? "/lineas" : "/paraderos")}
            />
        )
    } else {
        content = items.map((item) =>
            type === "lines" ? <LineCard key={`line-${item.id}`} line={item} /> : <StopCard key={`stop-${item.id}`} stop={item} />
        )
    }

    return (
        <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[styles.content, { padding: spacing.lg }]}
                refreshControl={
                    <RefreshControl refreshing={favorites.loading} onRefresh={favorites.refresh} tintColor={colors.primary} />
                }
            >
                <View style={styles.header}>
                    <AppText variant="title" accessibilityRole="header">
                        Favoritos
                    </AppText>
                    <AppText tone="muted">Tus accesos frecuentes. Toca el corazón para quitar uno.</AppText>
                    <Segmented options={tabs} value={type} onChange={setType} accessibilityLabel="Tipo de favorito" />
                </View>
                {content}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    content: {
        flexGrow: 1,
        gap: 12,
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingBottom: 32
    },
    header: {
        gap: 10,
        marginBottom: 4
    }
})
