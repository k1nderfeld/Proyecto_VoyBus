import { StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { Badge } from "./Badge"
import { Card } from "./Card"
import { LineBadge } from "./LineBadge"
import { useTheme } from "../context/ThemeContext"
import { formatDateTime, formatDuration } from "../lib/format"

const requestTone = { sent: "primary", next: "warning", closed: "neutral" }

// Un viaje del historial (ACC-07): fecha, línea, recorrido, paradero solicitado y estado final con su motivo.
// El paradero solicitado es donde la persona pidió bajar: nunca se presenta como una bajada confirmada.
export function HistoryCard({ entry }) {
    const { colors } = useTheme()
    const { line, route, requestedStop, request } = entry

    return (
        <Card
            onPress={() => router.push(`/historial/${entry.id}`)}
            accessibilityLabel={`Viaje del ${formatDateTime(entry.linkedAt)} en la línea ${line.code}`}
        >
            <View style={styles.header}>
                <LineBadge code={line.code} color={line.color} />
                <View style={styles.flex}>
                    <AppText variant="label" numberOfLines={1}>
                        {line.name}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                        {route.directionLabel} · {route.name}
                    </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>

            <View style={styles.meta}>
                <Ionicons name="calendar-outline" size={15} color={colors.muted} />
                <AppText variant="caption" tone="soft">
                    {formatDateTime(entry.linkedAt)} · {formatDuration(entry.linkedAt, entry.endedAt)}
                </AppText>
            </View>

            <View style={[styles.request, { backgroundColor: colors.surfaceAlt }]}>
                <AppText variant="overline" tone="muted">
                    Paradero solicitado
                </AppText>
                {requestedStop ? (
                    <>
                        <AppText variant="label">
                            {requestedStop.name} · {requestedStop.code}
                        </AppText>
                        <View style={styles.status}>
                            <Badge label={request.statusLabel} tone={requestTone[request.status]} />
                            {request.closeReasonLabel && (
                                <AppText variant="caption" tone="soft" style={styles.flex}>
                                    {request.closeReasonLabel}
                                </AppText>
                            )}
                        </View>
                    </>
                ) : (
                    <AppText variant="caption" tone="soft">
                        Sin solicitud de parada en este viaje · {entry.endReasonLabel}
                    </AppText>
                )}
            </View>
        </Card>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    flex: {
        flex: 1
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    request: {
        borderRadius: 12,
        padding: 12,
        gap: 4
    },
    status: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
    }
})
