import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { Button } from "./Button"
import { EmptyState, ErrorState, Loader } from "./States"
import { useTheme } from "../context/ThemeContext"

// Lista con carga progresiva y sus estados de carga, vacío y error (RNF-02, RNF-05).
// list es el resultado de usePagedList.
export function PagedList({ list, renderItem, header, emptyIcon, emptyTitle, emptyDescription, loadingLabel }) {
    const { colors, spacing } = useTheme()

    let empty = null
    if (list.loading) empty = <Loader label={loadingLabel} />
    else if (list.error) empty = <ErrorState message={list.error} onRetry={list.refresh} />
    else empty = <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />

    let footer = null
    if (list.loadingMore) footer = <ActivityIndicator color={colors.primary} style={styles.footer} />
    else if (list.moreError) {
        footer = <Button title="Cargar más" icon="refresh" variant="secondary" onPress={list.loadMore} style={styles.footer} />
    }

    return (
        <FlatList
            data={list.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListHeaderComponent={header}
            ListEmptyComponent={empty}
            ListFooterComponent={footer}
            ItemSeparatorComponent={Separator}
            onEndReached={list.loadMore}
            onEndReachedThreshold={0.4}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[styles.content, { padding: spacing.lg }]}
            refreshControl={
                <RefreshControl refreshing={Boolean(list.refreshing)} onRefresh={list.refresh} tintColor={colors.primary} />
            }
        />
    )
}

function Separator() {
    return <View style={styles.separator} />
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingBottom: 32
    },
    separator: {
        height: 12
    },
    footer: {
        marginTop: 16
    }
})
