import { Pressable, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../../components/AppText"
import { Badge } from "../../components/Badge"
import { Card } from "../../components/Card"
import { LineBadge } from "../../components/LineBadge"
import { RequireAuth } from "../../components/RequireAuth"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { ErrorState, Loader, Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useApiData } from "../../hooks/useApiData"
import { api } from "../../api/client"
import { formatDateTime, formatDuration, formatTime, methodLabel } from "../../lib/format"

const requestTone = { sent: "primary", next: "warning", closed: "neutral" }

// Detalle de un viaje del historial (ACC-07). Un registro de otra cuenta responde 404 desde el backend.
export default function HistoryEntryScreen() {
    return (
        <RequireAuth passengerOnly title="Detalle del viaje">
            <HistoryEntryContent />
        </RequireAuth>
    )
}

function HistoryEntryContent() {
    const { colors } = useTheme()
    const { entryId } = useLocalSearchParams()

    const entry = useApiData(
        ({ signal }) => api.get(`/users/me/history/${entryId}`, { signal }).then((response) => response.data),
        [entryId]
    )
    const data = entry.data

    if (entry.loading && !data) {
        return (
            <Screen>
                <ScreenHeader title="Detalle del viaje" fallback="/historial" />
                <Loader label="Cargando el viaje" />
            </Screen>
        )
    }

    if (entry.error || !data) {
        return (
            <Screen>
                <ScreenHeader title="Detalle del viaje" fallback="/historial" />
                <ErrorState message={entry.error} onRetry={entry.reload} />
            </Screen>
        )
    }

    const { line, route } = data

    return (
        <Screen refreshing={entry.loading} onRefresh={entry.reload}>
            <ScreenHeader title="Detalle del viaje" fallback="/historial" />

            <View style={styles.intro}>
                <AppText variant="overline" tone="primary">
                    {formatDateTime(data.linkedAt)}
                </AppText>
                <AppText variant="title" accessibilityRole="header">
                    {line.name}
                </AppText>
            </View>

            <Card onPress={() => router.push(`/lineas/${line.id}?ruta=${route.id}`)} accessibilityLabel={`Ver línea ${line.code}`}>
                <View style={styles.row}>
                    <LineBadge code={line.code} color={line.color} />
                    <View style={styles.flex}>
                        <AppText variant="label">{route.directionLabel} · {route.name}</AppText>
                        {line.status !== "active" && (
                            <AppText variant="caption" tone="muted">
                                {line.status === "inactive" ? "Esta línea ya no está en servicio." : "Esta línea está suspendida."}
                            </AppText>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
            </Card>

            <Card>
                <AppText variant="subtitle">Tu viaje</AppText>
                <InfoRow label="Vinculación" value={methodLabel(data.method)} />
                <InfoRow label="Tiempo vinculado" value={formatDuration(data.linkedAt, data.endedAt)} />
                <InfoRow label="Vehículo" value={`${data.vehicle.code} · ${data.vehicle.plate}`} />
                <InfoRow label="Fin de la vinculación" value={data.endReasonLabel} />
            </Card>

            <Card>
                <AppText variant="subtitle">Solicitudes de parada</AppText>
                {data.requests.length ? (
                    data.requests.map((request) => (
                        <Pressable
                            key={request.id}
                            onPress={() => router.push(`/paraderos/${request.stop.id}`)}
                            accessibilityRole="button"
                            accessibilityLabel={`Solicitud de parada en ${request.stop.name}, ${request.statusLabel}`}
                            style={({ pressed }) => [styles.request, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                        >
                            <View style={styles.row}>
                                <Ionicons name="location" size={18} color={colors.primary} />
                                <AppText variant="label" style={styles.flex}>
                                    {request.stop.name} · {request.stop.code}
                                </AppText>
                                <Badge label={request.statusLabel} tone={requestTone[request.status]} />
                            </View>
                            <AppText variant="caption" tone="muted">
                                Pedida a las {formatTime(request.requestedAt)}
                                {request.closedAt ? ` · cerrada a las ${formatTime(request.closedAt)}` : ""}
                            </AppText>
                            {request.closeReasonLabel && (
                                <AppText variant="caption" tone="soft">
                                    {request.closeReasonLabel}
                                </AppText>
                            )}
                        </Pressable>
                    ))
                ) : (
                    <AppText variant="caption" tone="muted">
                        En este viaje no pediste ninguna parada.
                    </AppText>
                )}
            </Card>

            <Notice tone="info" title="Sobre el paradero solicitado">
                {data.notice}
            </Notice>
        </Screen>
    )
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.info}>
            <AppText variant="caption" tone="muted">
                {label}
            </AppText>
            <AppText variant="label" style={styles.infoValue}>
                {value}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    intro: {
        gap: 4
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    flex: {
        flex: 1
    },
    request: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        gap: 4
    },
    info: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12
    },
    infoValue: {
        flexShrink: 1,
        textAlign: "right"
    }
})
