import { useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../../components/AppText"
import { Badge } from "../../components/Badge"
import { Card } from "../../components/Card"
import { FavoriteButton } from "../../components/FavoriteButton"
import { LineBadge } from "../../components/LineBadge"
import { NetworkMap } from "../../components/NetworkMap"
import { RouteStopList } from "../../components/RouteStopList"
import { ScheduleList } from "../../components/ScheduleList"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { Segmented } from "../../components/Segmented"
import { ErrorState, Loader, Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useApiData } from "../../hooks/useApiData"
import { api } from "../../api/client"
import { formatDistance, routeLength } from "../../lib/geo"
import { statusLabel, statusTone } from "../../lib/labels"

// Detalle de una línea (RED-01): recorridos y sentidos, horarios, mapa y paraderos en orden.
// ?ruta=<id> abre directamente un recorrido (por ejemplo desde el detalle de un paradero).
export default function LineDetailScreen() {
    const { colors } = useTheme()
    const params = useLocalSearchParams()
    const lineId = params.lineId
    const [selectedRouteId, setSelectedRouteId] = useState(null)

    const lineData = useApiData(
        ({ signal }) => api.get(`/lines/${lineId}`, { signal }).then((response) => response.data),
        [lineId]
    )
    const line = lineData.data

    const requestedRoute = line?.routes.find((route) => String(route.id) === String(params.ruta))
    const routeId = selectedRouteId ?? requestedRoute?.id ?? line?.routes[0]?.id ?? null

    // Al cambiar de recorrido se vuelven a pedir sus paraderos y su trazado.
    const routeData = useApiData(
        ({ signal }) =>
            routeId
                ? api.get(`/lines/${lineId}/routes/${routeId}`, { signal }).then((response) => response.data)
                : Promise.resolve(null),
        [lineId, routeId]
    )
    const detail = routeData.data?.route.id === routeId ? routeData.data : null

    if (lineData.loading && !line) {
        return (
            <Screen>
                <ScreenHeader title="Línea" fallback="/lineas" />
                <Loader label="Cargando línea" />
            </Screen>
        )
    }

    if (lineData.error || !line) {
        return (
            <Screen onRefresh={lineData.reload}>
                <ScreenHeader title="Línea" fallback="/lineas" />
                <ErrorState message={lineData.error} onRetry={lineData.reload} />
            </Screen>
        )
    }

    const selectedRoute = line.routes.find((route) => route.id === routeId)

    return (
        <Screen refreshing={lineData.loading} onRefresh={lineData.reload}>
            <ScreenHeader
                title={`Línea ${line.code}`}
                fallback="/lineas"
                action={<FavoriteButton type="lines" item={line} />}
            />

            <View style={styles.hero}>
                <LineBadge code={line.code} color={line.color} size="lg" />
                <View style={styles.heroText}>
                    <AppText variant="title" accessibilityRole="header">
                        {line.name}
                    </AppText>
                    <Badge label={statusLabel(line)} tone={statusTone(line.status)} />
                </View>
            </View>

            {line.notice && (
                <Notice tone="warning" title="Servicio suspendido">
                    {line.notice}
                </Notice>
            )}

            {!line.routes.length ? (
                <Notice tone="info">Esta línea todavía no tiene recorridos publicados.</Notice>
            ) : (
                <>
                    <View style={styles.section}>
                        <AppText variant="label" tone="soft">
                            Sentido del recorrido
                        </AppText>
                        <Segmented
                            options={line.routes.map((route) => ({
                                value: route.id,
                                label: route.directionLabel,
                                icon: route.direction === "outbound" ? "arrow-forward" : "arrow-back"
                            }))}
                            value={routeId}
                            onChange={setSelectedRouteId}
                            accessibilityLabel="Sentido del recorrido"
                        />
                        {selectedRoute && (
                            <View style={styles.endpoints}>
                                <Ionicons name="navigate-circle-outline" size={18} color={colors.muted} />
                                <AppText variant="caption" tone="soft" style={styles.flex}>
                                    {selectedRoute.origin && selectedRoute.destination
                                        ? `${selectedRoute.origin.name} → ${selectedRoute.destination.name}`
                                        : selectedRoute.name}
                                </AppText>
                            </View>
                        )}
                    </View>

                    <View>
                        <NetworkMap
                            style={styles.map}
                            fitToPoints
                            path={detail?.path ?? []}
                            pathColor={line.color}
                            markers={(detail?.stops ?? []).map((stop) => ({
                                id: stop.id,
                                latitude: stop.latitude,
                                longitude: stop.longitude,
                                title: `${stop.order}. ${stop.name}`,
                                description: stop.code,
                                color: line.color
                            }))}
                        />
                        {routeData.loading && (
                            <View style={[styles.mapLoading, { backgroundColor: colors.surface }]}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        )}
                    </View>

                    {routeData.error && !routeData.loading && (
                        <ErrorState message={routeData.error} onRetry={routeData.reload} />
                    )}

                    {detail && (
                        <>
                            <View style={styles.stats}>
                                <Stat icon="location-outline" value={detail.stops.length} label="paraderos" />
                                <Stat icon="resize-outline" value={formatDistance(routeLength(detail.path))} label="aprox. en línea recta" />
                            </View>

                            <Card>
                                <AppText variant="subtitle">Horarios</AppText>
                                <ScheduleList schedules={detail.route.schedules} />
                            </Card>

                            <Card>
                                <AppText variant="subtitle">Paraderos del recorrido</AppText>
                                <AppText variant="caption" tone="muted">
                                    En el orden en que los recorre el servicio. Toca uno para ver su detalle.
                                </AppText>
                                {detail.stops.length ? (
                                    <RouteStopList stops={detail.stops} color={line.color} />
                                ) : (
                                    <AppText variant="caption" tone="muted">
                                        Este recorrido no tiene paraderos activos por ahora.
                                    </AppText>
                                )}
                            </Card>
                        </>
                    )}
                </>
            )}
        </Screen>
    )
}

function Stat({ icon, value, label }) {
    const { colors, radius } = useTheme()

    return (
        <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Ionicons name={icon} size={18} color={colors.primary} />
            <AppText variant="subtitle">{value}</AppText>
            <AppText variant="caption" tone="muted">
                {label}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    hero: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    heroText: {
        flex: 1,
        gap: 6
    },
    section: {
        gap: 8
    },
    endpoints: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    flex: {
        flex: 1
    },
    map: {
        height: 260
    },
    mapLoading: {
        position: "absolute",
        top: 12,
        right: 12,
        padding: 8,
        borderRadius: 20
    },
    stats: {
        flexDirection: "row",
        gap: 12
    },
    stat: {
        flex: 1,
        borderWidth: 1,
        padding: 12,
        gap: 2
    }
})
