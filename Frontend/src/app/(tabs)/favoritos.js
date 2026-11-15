import { router } from "expo-router"
import { ComingSoon } from "../../components/ComingSoon"
import { AppText } from "../../components/AppText"
import { EmptyState } from "../../components/States"
import { Screen } from "../../components/Screen"
import { useAuth } from "../../context/AuthContext"

// La lista de favoritos se completa en la rama feat/accountScreens (ACC-05).
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

    return (
        <ComingSoon
            title="Favoritos"
            icon="heart-outline"
            description="Aquí verás las líneas y paraderos que guardaste."
        />
    )
}
