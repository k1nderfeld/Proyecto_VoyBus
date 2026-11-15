import { Link } from "react-router-dom"
import { Icon } from "../components/Icon"
import { LogoMark } from "../components/Logo"

const suggestions = [
    { to: "/lineas", label: "Líneas y recorridos", icon: "bus" },
    { to: "/paraderos", label: "Paraderos de la red", icon: "pin" },
    { to: "/favoritos", label: "Mis favoritos", icon: "heart" },
    { to: "/historial", label: "Historial de viajes", icon: "history" }
]

export function NotFoundPage() {
    return (
        <div className="not-found">
            <div className="not-found-visual">
                <span className="not-found-code">404</span>
                <span className="not-found-mark">
                    <LogoMark size={72} />
                </span>
                <span className="not-found-route" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
            </div>

            <h1>Esa ruta no existe</h1>
            <p>
                La página que buscas no está disponible o cambió de dirección. Puedes volver al inicio o seguir
                explorando la red de Antofagasta.
            </p>

            <div className="not-found-actions">
                <Link className="button button-primary" to="/">
                    <Icon name="home" size={17} />
                    Volver al inicio
                </Link>
                <Link className="button button-ghost" to="/lineas">
                    Explorar líneas
                    <Icon name="arrow-right" size={16} />
                </Link>
            </div>

            <div className="not-found-links">
                {suggestions.map((item) => (
                    <Link key={item.to} to={item.to}>
                        <Icon name={item.icon} size={17} />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}
