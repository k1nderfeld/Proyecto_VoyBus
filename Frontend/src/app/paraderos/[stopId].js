import { Linking, Pressable, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../../components/AppText"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { FavoriteButton } from "../../components/FavoriteButton"
import { LineBadge } from "../../components/LineBadge"
import { NetworkMap } from "../../components/NetworkMap"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { ErrorState, Loader, Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"
import { useApiData } from "../../hooks/useApiData"
import { api } from "../../api/client"
import { mapsLink } from "../../lib/geo"
import { statusLabel, statusTone } from "../../lib/labels"

// Detalle de un paradero (RED-02): ubicación, líneas que pasan y sus sentidos, con acceso a cada recorrido.
export default function StopDetailScreen() {
    const { colors, radius } = useTheme()
    const toast = useToast()
    const { stopId } = useLocalSearchParams()

    const stopData = useApiData(
        ({ signal }) => api.get(`/stops/${stopId}`, { signal }).then((response) => response.data),
        [stopId]
    )
    const stop = stopData.data

    if (stopData.loading && !stop) {
        return (
            <Screen>
                <ScreenHeader title="Paradero" fallback="/paraderos" />
                <Loader label="Cargando paradero" />
            </Screen>
        )
    }

    if (stopData.error || !stop) {
        return (
            <Screen onRefresh={stopData.reload}>
                <ScreenHeader title="Paradero" fallback="/paraderos" />
                <ErrorState message={stopData.error} onRetry={stopData.reload} />
            </Screen>
        )
    }

    const openDirections = () =>
        Linking.openURL(mapsLink(stop)).catch(() => toast.error("No se pudo abrir la aplicación de mapas."))

    return (
        <Screen refreshing={stopData.loading} onRefresh={stopData.reload}>
            <ScreenHeader
                title={`Paradero ${stop.code}`}
                fallback="/paraderos"
                action={<FavoriteButton type="stops" item={stop} />}
            />

            <View style={styles.intro}>
                <AppText variant="title" accessibilityRole="header">
                    {stop.name}
                </AppText>
                <AppText tone="muted">Código {stop.code}</AppText>
            </View>

            <NetworkMap
                style={styles.map}
                fitToPoints
                selectedId={stop.id}
                markers={[{ id: stop.id, latitude: stop.latitude, longitude: stop.longitude, title: stop.name, description: stop.code }]}
            />

            <Button title="Cómo llegar" icon="navigate-outline" variant="secondary" onPress={openDirections} />

            <View style={styles.section}>
                <AppText variant="subtitle">Líneas que pasan por aquí</AppText>
                {!stop.lines.length && (
                    <Notice tone="info">Por ahora ninguna línea en servicio pasa por este paradero.</Notice>
                )}
            </View>

            {stop.lines.map((line) => (
                <Card key={line.id}>
                    <Pressable
                        onPress={() => router.push(`/lineas/${line.id}`)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver línea ${line.code}, ${line.name}`}
                        style={styles.lineHeader}
                    >
                        <LineBadge code={line.code} color={line.color} />
                        <View style={styles.flex}>
                            <AppText variant="label">{line.name}</AppText>
                            <Badge label={statusLabel(line)} tone={statusTone(line.status)} />
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>

                    {line.notice && (
                        <AppText variant="caption" tone="warning">
                            {line.notice}
                        </AppText>
                    )}

                    <View style={styles.routes}>
                        {line.routes.map((route) => (
                            <Pressable
                                key={route.id}
                                onPress={() => router.push(`/lineas/${line.id}?ruta=${route.id}`)}
                                accessibilityRole="button"
                                accessibilityLabel={`Ver recorrido de ${route.directionLabel}: ${route.name}`}
                                style={({ pressed }) => [
                                    styles.route,
                                    {
                                        backgroundColor: colors.surfaceAlt,
                                        borderRadius: radius.md,
                                        opacity: pressed ? 0.75 : 1
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={route.direction === "outbound" ? "arrow-forward-circle" : "arrow-back-circle"}
                                    size={20}
                                    color={colors.primary}
                                />
                                <View style={styles.flex}>
                                    <AppText variant="caption" weight="bold">
                                        {route.directionLabel}
                                    </AppText>
                                    <AppText variant="caption" tone="muted">
                                        {route.name}
                                    </AppText>
                                </View>
                                <Ionicons name="map-outline" size={18} color={colors.muted} />
                            </Pressable>
                        ))}
                    </View>
                </Card>
            ))}
        </Screen>
    )
}

const styles = StyleSheet.create({
    intro: {
        gap: 4
    },
    map: {
        height: 200
    },
    section: {
        gap: 8
    },
    lineHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    flex: {
        flex: 1,
        gap: 4
    },
    routes: {
        gap: 8
    },
    route: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 10
    }
})
