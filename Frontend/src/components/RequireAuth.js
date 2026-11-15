import { Redirect, usePathname } from "expo-router"
import { Screen } from "./Screen"
import { ScreenHeader } from "./ScreenHeader"
import { EmptyState } from "./States"
import { useAuth } from "../context/AuthContext"

// Protege las pantallas de la cuenta: sin sesión lleva a iniciar sesión y vuelve después.
// Con passengerOnly, las cuentas de conductor o administrador ven un aviso en vez del contenido.
export function RequireAuth({ passengerOnly = false, title, children }) {
    const { user, isPassenger } = useAuth()
    const pathname = usePathname()

    if (!user) return <Redirect href={`/login?next=${encodeURIComponent(pathname)}`} />

    if (passengerOnly && !isPassenger) {
        return (
            <Screen>
                <ScreenHeader title={title} fallback="/perfil" />
                <EmptyState
                    icon="lock-closed-outline"
                    title="Sección para pasajeros"
                    description="Esta sección está disponible solo para cuentas de pasajero."
                />
            </Screen>
        )
    }

    return children
}
