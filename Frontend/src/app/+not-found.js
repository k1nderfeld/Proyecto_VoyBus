import { router } from "expo-router"
import { Screen } from "../components/Screen"
import { EmptyState } from "../components/States"

export default function NotFoundScreen() {
    return (
        <Screen edges={["top", "bottom"]}>
            <EmptyState
                icon="map-outline"
                title="No encontramos esta pantalla"
                description="Puede que el enlace esté incompleto o ya no exista."
                actionLabel="Ir al inicio"
                onAction={() => router.replace("/")}
            />
        </Screen>
    )
}
