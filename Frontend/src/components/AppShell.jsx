import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { Avatar } from "./Avatar"
import { Icon } from "./Icon"
import { Logo } from "./Logo"

const primaryLinks = [
    { to: "/", label: "Inicio", icon: "home", end: true },
    { to: "/lineas", label: "Líneas", icon: "bus" },
    { to: "/paraderos", label: "Paraderos", icon: "pin" },
    { to: "/favoritos", label: "Favoritos", icon: "heart" },
    { to: "/historial", label: "Historial", icon: "history" }
]

const secondaryLinks = [
    { to: "/preferencias", label: "Preferencias", icon: "sliders" },
    { to: "/seguridad", label: "Seguridad", icon: "shield" }
]

const tabs = [
    { to: "/", label: "Inicio", icon: "home", end: true },
    { to: "/lineas", label: "Líneas", icon: "bus" },
    { to: "/paraderos", label: "Paraderos", icon: "pin" },
    { to: "/favoritos", label: "Favoritos", icon: "heart" },
    { to: "/perfil", label: "Perfil", icon: "user" }
]

const navClass = ({ isActive }) => `side-link ${isActive ? "is-active" : ""}`.trim()
const tabClass = ({ isActive }) => `tab ${isActive ? "is-active" : ""}`.trim()

export function AppShell() {
    const { user, logout } = useAuth()
    const { success, error } = useToast()
    const navigate = useNavigate()
    const location = useLocation()

    const onLogout = async () => {
        try {
            await logout()
            success("Cerraste sesión correctamente.")
            navigate("/")
        } catch (requestError) {
            error(requestError.message)
        }
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <NavLink to="/" aria-label="VoyBus, ir al inicio">
                        <Logo size={42} tagline />
                    </NavLink>
                </div>

                <nav className="side-nav" aria-label="Navegación principal">
                    <p className="side-label">Explorar</p>
                    {primaryLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                            <span className="side-icon">
                                <Icon name={link.icon} size={19} />
                            </span>
                            {link.label}
                        </NavLink>
                    ))}

                    <p className="side-label">Mi cuenta</p>
                    {secondaryLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} className={navClass}>
                            <span className="side-icon">
                                <Icon name={link.icon} size={19} />
                            </span>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-foot">
                    {user ? (
                        <div className="account-card">
                            <NavLink to="/perfil" className="account-link">
                                <Avatar user={user} size={38} />
                                <span className="account-copy">
                                    <strong>{user.alias || user.name}</strong>
                                    <span>{user.email || user.phone}</span>
                                </span>
                            </NavLink>
                            <button type="button" className="account-logout" onClick={onLogout} aria-label="Cerrar sesión">
                                <Icon name="logout" size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="sidebar-cta">
                            <span className="sidebar-cta-icon">
                                <Icon name="sparkles" size={18} />
                            </span>
                            <p>Guarda tus líneas y paraderos favoritos.</p>
                            <NavLink className="button button-primary button-small" to={`/login?next=${encodeURIComponent(location.pathname)}`}>
                                Iniciar sesión
                            </NavLink>
                            <NavLink className="sidebar-cta-link" to="/registro">
                                Crear una cuenta
                            </NavLink>
                        </div>
                    )}
                </div>
            </aside>

            <div className="app-main">
                <header className="mobile-topbar">
                    <NavLink to="/" aria-label="VoyBus, ir al inicio">
                        <Logo size={34} />
                    </NavLink>
                    {user ? (
                        <NavLink to="/perfil" className="mobile-avatar" aria-label="Mi perfil">
                            <Avatar user={user} size={38} />
                        </NavLink>
                    ) : (
                        <NavLink className="button button-primary button-small" to={`/login?next=${encodeURIComponent(location.pathname)}`}>
                            Ingresar
                        </NavLink>
                    )}
                </header>

                <main className="content" id="main">
                    <Outlet />
                </main>

                <nav className="tabbar" aria-label="Navegación principal">
                    {tabs.map((tab) => (
                        <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
                            <span className="tab-icon">
                                <Icon name={tab.icon} size={21} />
                            </span>
                            <span>{tab.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    )
}
