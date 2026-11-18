import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "../../components/AppText"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { LineBadge } from "../../components/LineBadge"
import { LineCard } from "../../components/LineCard"
import { Logo } from "../../components/Logo"
import { Screen } from "../../components/Screen"
import { Loader, Notice } from "../../components/States"
import { useAuth } from "../../context/AuthContext"
import { useFavorites } from "../../context/FavoritesContext"
import { useTheme } from "../../context/ThemeContext"
import { useApiData } from "../../hooks/useApiData"
import { api } from "../../api/client"
import { greeting } from "../../lib/format"

const PREVIEW_LINES = 3

const shortcuts = [
    {
        href: "/lineas",
        icon: "bus",
        title: "Líneas y recorridos",
        description: "Busca una línea y revisa sus recorridos, horarios y paraderos."
    },
    {
        href: "/paraderos",
        icon: "location",
        title: "Paraderos",
        description: "Encuentra paraderos en el mapa y las líneas que pasan por ellos."
    }
]

export default function HomeScreen() {
    const { colors } = useTheme()
    const { user, isPassenger } = useAuth()
    const favorites = useFavorites()
    const firstName = user?.alias || user?.name?.split(" ")[0]

    const preview = useApiData(
        ({ signal }) => api.get(`/lines?limit=${PREVIEW_LINES}`, { signal }).then((response) => response.data),
        []
    )

    const hasFavorites = favorites.lines.length > 0 || favorites.stops.length > 0

    return (
        <Screen refreshing={preview.loading && Boolean(preview.data)} onRefresh={preview.reload}>
            <Logo size={34} />

            <View style={styles.intro}>
                <AppText variant="overline" tone="primary">
                    {greeting()}
                </AppText>
                <AppText variant="display" accessibilityRole="header">
                    {firstName ? `Hola, ${firstName}` : "Tu ciudad, a un viaje de distancia"}
                </AppText>
                <AppText tone="muted">Consulta el transporte público de Antofagasta desde tu teléfono.</AppText>
            </View>

            {shortcuts.map((shortcut) => (
                <Card key={shortcut.href} onPress={() => router.push(shortcut.href)} accessibilityLabel={shortcut.title}>
                    <View style={styles.shortcut}>
                        <View style={[styles.shortcutIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name={shortcut.icon} size={22} color={colors.primary} />
                        </View>
                        <View style={styles.flex}>
                            <AppText variant="subtitle">{shortcut.title}</AppText>
                            <AppText variant="caption" tone="muted">
                                {shortcut.description}
                            </AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                    </View>
                </Card>
            ))}

            {isPassenger && hasFavorites && (
                <View style={styles.section}>
                    <AppText variant="subtitle">Tus favoritos</AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                        {favorites.lines.map((line) => (
                            <FavoriteChip
                                key={`line-${line.id}`}
                                label={line.name}
                                accessibilityLabel={`Línea favorita ${line.code}, ${line.name}`}
                                onPress={() => router.push(`/lineas/${line.id}`)}
                                leading={<LineBadge code={line.code} color={line.color} size="sm" />}
                            />
                        ))}
                        {favorites.stops.map((stop) => (
                            <FavoriteChip
                                key={`stop-${stop.id}`}
                                label={stop.name}
                                accessibilityLabel={`Paradero favorito ${stop.name}`}
                                onPress={() => router.push(`/paraderos/${stop.id}`)}
                                leading={<Ionicons name="location" size={16} color={colors.primary} />}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <AppText variant="subtitle">Líneas</AppText>
                    <Button title="Ver todas" variant="ghost" size="sm" onPress={() => router.push("/lineas")} />
                </View>
                {preview.loading && !preview.data ? (
                    <Loader label="Cargando líneas" />
                ) : preview.error ? (
                    <Notice tone="danger" title="No se pudieron cargar las líneas">
                        {preview.error}
                    </Notice>
                ) : (
                    preview.data?.items.map((line) => <LineCard key={line.id} line={line} />)
                )}
            </View>

            {!user && (
                <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
                    <AppText variant="subtitle">Guarda tus líneas y paraderos</AppText>
                    <AppText tone="soft">
                        Con una cuenta puedes guardar favoritos y revisar el historial de tus viajes.
                    </AppText>
                    <View style={styles.actions}>
                        <Button title="Crear cuenta" onPress={() => router.push("/registro")} style={styles.action} />
                        <Button
                            title="Iniciar sesión"
                            variant="secondary"
                            onPress={() => router.push("/login")}
                            style={styles.action}
                        />
                    </View>
                </Card>
            )}
        </Screen>
    )
}

function FavoriteChip({ label, leading, onPress, accessibilityLabel }) {
    const { colors, radius } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={({ pressed }) => [
                styles.chip,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                    opacity: pressed ? 0.75 : 1
                }
            ]}
        >
            {leading}
            <AppText variant="caption" weight="semibold" numberOfLines={1} style={styles.chipText}>
                {label}
            </AppText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    intro: {
        gap: 6,
        marginTop: 8
    },
    shortcut: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    shortcutIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center"
    },
    flex: {
        flex: 1,
        gap: 2
    },
    section: {
        gap: 10
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    chips: {
        gap: 8,
        paddingRight: 8
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        paddingVertical: 6,
        paddingLeft: 8,
        paddingRight: 14,
        maxWidth: 240
    },
    chipText: {
        flexShrink: 1
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap"
    },
    action: {
        flexGrow: 1
    }
})
