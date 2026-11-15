import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { HistoryCard } from "../../components/HistoryCard"
import { PagedList } from "../../components/PagedList"
import { RequireAuth } from "../../components/RequireAuth"
import { ScreenHeader } from "../../components/ScreenHeader"
import { Segmented } from "../../components/Segmented"
import { Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useApiData } from "../../hooks/useApiData"
import { usePagedList } from "../../hooks/usePagedList"
import { api, queryString } from "../../api/client"
import { daysFromNowISO } from "../../lib/format"

const PAGE_SIZE = 10

const periods = [
    { value: "all", label: "Todo" },
    { value: "7", label: "7 días" },
    { value: "30", label: "30 días" },
    { value: "90", label: "90 días" }
]

// Historial personal (ACC-07): viajes vinculados del más reciente al más antiguo, con filtros por fecha y línea.
export default function HistoryScreen() {
    return (
        <RequireAuth passengerOnly title="Historial de viajes">
            <HistoryContent />
        </RequireAuth>
    )
}

function HistoryContent() {
    const { colors, spacing } = useTheme()
    const [period, setPeriod] = useState("all")
    const [lineId, setLineId] = useState(null)

    const from = period === "all" ? undefined : daysFromNowISO(-Number(period))

    const lines = useApiData(
        ({ signal }) => api.get("/lines?limit=50", { signal }).then((response) => response.data.items),
        []
    )

    const list = usePagedList(
        ({ page, signal }) =>
            api
                .get(`/users/me/history${queryString({ from, lineId, page, limit: PAGE_SIZE })}`, { signal })
                .then((response) => response.data),
        [from, lineId]
    )

    const filtered = period !== "all" || lineId

    const header = (
        <View style={styles.header}>
            <ScreenHeader title="Historial de viajes" fallback="/perfil" />
            <AppText variant="title" accessibilityRole="header">
                Tus viajes
            </AppText>

            <Segmented options={periods} value={period} onChange={setPeriod} accessibilityLabel="Período" />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <Chip label="Todas las líneas" selected={!lineId} onPress={() => setLineId(null)} />
                {(lines.data ?? []).map((line) => (
                    <Chip
                        key={line.id}
                        label={`${line.code} · ${line.name}`}
                        selected={lineId === line.id}
                        onPress={() => setLineId(line.id)}
                    />
                ))}
            </ScrollView>

            {list.meta?.notice && <Notice tone="info">{list.meta.notice}</Notice>}

            {!list.loading && !list.error && list.items.length > 0 && (
                <AppText variant="caption" tone="muted">
                    {list.total === 1 ? "1 viaje" : `${list.total} viajes`}
                    {filtered ? " con estos filtros" : ""}
                </AppText>
            )}
        </View>
    )

    return (
        <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background, paddingTop: spacing.xs }]}>
            <PagedList
                list={list}
                header={header}
                renderItem={({ item }) => <HistoryCard entry={item} />}
                loadingLabel="Cargando tus viajes"
                emptyIcon="time-outline"
                emptyTitle={filtered ? "No hay viajes con estos filtros" : "Aún no tienes viajes"}
                emptyDescription={
                    filtered
                        ? "Prueba con otro período o con todas las líneas."
                        : "Cuando te vincules a un vehículo, tus viajes aparecerán aquí."
                }
            />
        </SafeAreaView>
    )
}

function Chip({ label, selected, onPress }) {
    const { colors, radius } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
                styles.chip,
                {
                    borderRadius: radius.pill,
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border
                }
            ]}
        >
            <AppText variant="caption" weight="semibold" style={{ color: selected ? colors.onPrimary : colors.text }}>
                {label}
            </AppText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    header: {
        gap: 12,
        marginBottom: 16
    },
    chips: {
        gap: 8,
        paddingRight: 8
    },
    chip: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7
    }
})
