import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { LineCard } from "../../components/LineCard"
import { PagedList } from "../../components/PagedList"
import { SearchBar } from "../../components/SearchBar"
import { useTheme } from "../../context/ThemeContext"
import { useDebounced } from "../../hooks/useApiData"
import { usePagedList } from "../../hooks/usePagedList"
import { api, queryString } from "../../api/client"

const PAGE_SIZE = 20

// Consulta de líneas (RED-01): disponible sin iniciar sesión. Las desactivadas no llegan del backend.
export default function LinesScreen() {
    const { colors } = useTheme()
    const [query, setQuery] = useState("")
    const search = useDebounced(query.trim())

    const list = usePagedList(
        ({ page, signal }) =>
            api.get(`/lines${queryString({ search, page, limit: PAGE_SIZE })}`, { signal }).then((response) => response.data),
        [search]
    )

    const header = (
        <View style={styles.header}>
            <AppText variant="title" accessibilityRole="header">
                Líneas
            </AppText>
            <AppText tone="muted">Busca por nombre o código y revisa sus recorridos.</AppText>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre o código" />
            {!list.loading && !list.error && list.items.length > 0 && (
                <AppText variant="caption" tone="muted">
                    {list.total === 1 ? "1 línea" : `${list.total} líneas`}
                    {search ? ` para “${search}”` : ""}
                </AppText>
            )}
        </View>
    )

    return (
        <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
            <PagedList
                list={list}
                header={header}
                renderItem={({ item }) => <LineCard line={item} />}
                loadingLabel="Cargando líneas"
                emptyIcon={search ? "search-outline" : "bus-outline"}
                emptyTitle={search ? "Sin resultados" : "No hay líneas disponibles"}
                emptyDescription={
                    search
                        ? `No encontramos líneas que coincidan con “${search}”. Prueba con otro nombre o código.`
                        : "Por ahora no hay líneas en servicio. Vuelve a intentarlo más tarde."
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    header: {
        gap: 10,
        marginBottom: 16
    }
})
