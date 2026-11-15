import { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { ProtectedRoute, ScrollToTop } from "./components/Routing"
import { HomePage } from "./pages/HomePage"
import { LinesPage } from "./pages/LinesPage"
import { LineDetailPage } from "./pages/LineDetailPage"
import { StopsPage } from "./pages/StopsPage"
import { StopDetailPage } from "./pages/StopDetailPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { HistoryPage } from "./pages/HistoryPage"
import { HistoryDetailPage } from "./pages/HistoryDetailPage"
import { ProfilePage } from "./pages/ProfilePage"
import { PreferencesPage } from "./pages/PreferencesPage"
import { SecurityPage } from "./pages/SecurityPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage"
import { NotFoundPage } from "./pages/NotFoundPage"

const titles = [
    [/^\/$/, "VoyBus · Transporte público de Antofagasta"],
    [/^\/lineas\/\d+/, "Detalle de línea · VoyBus"],
    [/^\/lineas/, "Líneas y recorridos · VoyBus"],
    [/^\/paraderos\/\d+/, "Detalle de paradero · VoyBus"],
    [/^\/paraderos/, "Paraderos · VoyBus"],
    [/^\/favoritos/, "Mis favoritos · VoyBus"],
    [/^\/historial\/\d+/, "Detalle del viaje · VoyBus"],
    [/^\/historial/, "Historial de viajes · VoyBus"],
    [/^\/perfil/, "Mi perfil · VoyBus"],
    [/^\/preferencias/, "Preferencias · VoyBus"],
    [/^\/seguridad/, "Seguridad · VoyBus"],
    [/^\/login/, "Iniciar sesión · VoyBus"],
    [/^\/registro/, "Crear cuenta · VoyBus"],
    [/^\/recuperar/, "Recuperar contraseña · VoyBus"],
    [/^\/restablecer|^\/reset-password/, "Nueva contraseña · VoyBus"],
    [/^\/confirmar-correo|^\/confirm-email/, "Confirmar correo · VoyBus"]
]

export default function App() {
    const { pathname } = useLocation()

    useEffect(() => {
        const match = titles.find(([pattern]) => pattern.test(pathname))
        document.title = match ? match[1] : "Página no encontrada · VoyBus"
    }, [pathname])

    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="lineas" element={<LinesPage />} />
                    <Route path="lineas/:lineId" element={<LineDetailPage />} />
                    <Route path="paraderos" element={<StopsPage />} />
                    <Route path="paraderos/:stopId" element={<StopDetailPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="favoritos" element={<FavoritesPage />} />
                        <Route path="historial" element={<HistoryPage />} />
                        <Route path="historial/:entryId" element={<HistoryDetailPage />} />
                        <Route path="perfil" element={<ProfilePage />} />
                        <Route path="preferencias" element={<PreferencesPage />} />
                        <Route path="seguridad" element={<SecurityPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="recuperar" element={<ForgotPasswordPage />} />
                <Route path="restablecer" element={<ResetPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="confirmar-correo" element={<ConfirmEmailPage />} />
                <Route path="confirm-email" element={<ConfirmEmailPage />} />
            </Routes>
        </>
    )
}
