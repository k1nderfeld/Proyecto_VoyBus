import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { NetworkMap } from "../../components/NetworkMap"
import { PagedList } from "../../components/PagedList"
import { SearchBar } from "../../components/SearchBar"
import { Segmented } from "../../components/Segmented"
import { StopCard } from "../../components/StopCard"
import { Notice } from "../../components/States"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"
import { useApiData, useDebounced } from "../../hooks/useApiData"
import { usePagedList } from "../../hooks/usePagedList"
import { api, queryString } from "../../api/client"
import { regionToBounds } from "../../lib/geo"

const MAP_LIMIT = 100
const PAGE_SIZE = 20

const views = [
    { value: "map", label: "Mapa", icon: "map-outline" },
    { value: "list", label: "Buscar", icon: "search-outline" }
]

// Consulta de paraderos (RED-02): desde el mapa o con la búsqueda, sin iniciar sesión.
export default function StopsScreen() {
    const { colors, spacing } = useTheme()
    const [view, setView] = useState("map")

    return (
        <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
            <View style={[styles.top, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
                <AppText variant="title" accessibilityRole="header">
                    Paraderos
                </AppText>
                <Segmented options={views} value={view} onChange={setView} accessibilityLabel="Forma de buscar paraderos" />
            </View>
            {view === "map" ? <StopsMap /> : <StopsSearch />}
        </SafeAreaView>
    )
}

// Mapa: solo se piden los paraderos de la zona visible, para no cargar todo el catálogo (RNF-05).
function StopsMap() {
    const { spacing } = useTheme()
    const toast = useToast()
    const [bounds, setBounds] = useState(null)
    const [selectedId, setSelectedId] = useState(null)
    const timer = useRef(null)

    useEffect(() => () => clearTimeout(timer.current), [])

    // Espera a que el mapa deje de moverse antes de pedir los paraderos de la nueva zona.
    const changeRegion = (region) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setBounds(regionToBounds(region)), 350)
    }

    const stops = useApiData(
        ({ signal }) =>
            bounds
                ? api.get(`/stops${queryString({ ...bounds, limit: MAP_LIMIT })}`, { signal }).then((response) => response.data)
                : Promise.resolve(null),
        [bounds?.minLat, bounds?.maxLat, bounds?.minLng, bounds?.maxLng]
    )

    const items = stops.data?.items ?? []
    const total = stops.data?.pagination.total ?? 0
    const selected = items.find((stop) => stop.id === selectedId)

    return (
        <View style={[styles.fill, { padding: spacing.lg, gap: spacing.md }]}>
            <View style={styles.fill}>
                <NetworkMap
                    style={styles.fill}
                    showLocateButton
                    onLocationError={toast.error}
                    onRegionChange={changeRegion}
                    selectedId={selectedId}
                    onMarkerPress={setSelectedId}
                    markers={items.map((stop) => ({
                        id: stop.id,
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        title: stop.name,
                        description: stop.lines.map((line) => line.code).join(" · ") || stop.code
                    }))}
                />
                {stops.loading && bounds && <ActivityIndicator style={styles.mapSpinner} />}
            </View>

            {stops.error ? (
                <Notice tone="danger" title="No se pudieron cargar los paraderos">
                    {stops.error}
                </Notice>
            ) : selected ? (
                <StopCard stop={selected} />
            ) : (
                <Notice tone="info">
                    {!stops.data
                        ? "Cargando los paraderos de la zona…"
                        : total === 0
                            ? "No hay paraderos en esta zona del mapa. Mueve el mapa o usa la búsqueda."
                            : total > items.length
                                ? `Hay ${total} paraderos en esta zona; se muestran ${items.length}. Acerca el mapa para verlos todos.`
                                : `${total === 1 ? "1 paradero" : `${total} paraderos`} en esta zona. Toca uno para ver sus líneas.`}
                </Notice>
            )}
        </View>
    )
}

function StopsSearch() {
    const [query, setQuery] = useState("")
    const search = useDebounced(query.trim())

    const list = usePagedList(
        ({ page, signal }) =>
            api.get(`/stops${queryString({ search, page, limit: PAGE_SIZE })}`, { signal }).then((response) => response.data),
        [search]
    )

    const header = (
        <View style={styles.searchHeader}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre o código" />
            {!list.loading && !list.error && list.items.length > 0 && (
                <AppText variant="caption" tone="muted">
                    {list.total === 1 ? "1 paradero" : `${list.total} paraderos`}
                    {search ? ` para “${search}”` : ""}
                </AppText>
            )}
        </View>
    )

    return (
        <PagedList
            list={list}
            header={header}
            renderItem={({ item }) => <StopCard stop={item} />}
            loadingLabel="Cargando paraderos"
            emptyIcon={search ? "search-outline" : "location-outline"}
            emptyTitle={search ? "Sin resultados" : "No hay paraderos disponibles"}
            emptyDescription={
                search
                    ? `No encontramos paraderos que coincidan con “${search}”. Prueba con otro nombre o código.`
                    : "Por ahora no hay paraderos publicados."
            }
        />
    )
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    top: {
        gap: 12
    },
    mapSpinner: {
        position: "absolute",
        top: 14,
        right: 14
    },
    searchHeader: {
        gap: 10,
        marginBottom: 16
    }
})
