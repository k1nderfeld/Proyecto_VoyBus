import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader } from "./States"
import { LogoMark } from "./Logo"

export function ProtectedRoute() {
    const { user, ready } = useAuth()
    const location = useLocation()

    if (!ready) {
        return (
            <div className="route-loading">
                <LogoMark size={54} />
                <Loader label="Preparando tu cuenta" />
            </div>
        )
    }

    if (!user) {
        const next = encodeURIComponent(location.pathname + location.search)
        return <Navigate to={`/login?next=${next}`} replace />
    }

    return <Outlet />
}

export function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" })
    }, [pathname])

    return null
}
