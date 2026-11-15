import { Link } from "react-router-dom"
import { Icon } from "./Icon"
import { Logo } from "./Logo"

const highlights = [
    {
        icon: "bus",
        title: "Toda la red de Antofagasta",
        text: "Líneas, recorridos y horarios en un solo lugar."
    },
    {
        icon: "heart",
        title: "Tus favoritos a mano",
        text: "Guarda las líneas y paraderos que más usas."
    },
    {
        icon: "history",
        title: "Viajes siempre disponibles",
        text: "Revisa tu historial cuando lo necesites."
    }
]

export function AuthShell({ title, description, children, footer, wide = false }) {
    return (
        <div className="auth-page">
            <aside className="auth-aside">
                <Link className="auth-brand" to="/" aria-label="VoyBus, ir al inicio">
                    <Logo size={44} tagline />
                </Link>

                <div className="auth-aside-copy">
                    <span className="auth-badge">
                        <Icon name="sparkles" size={15} />
                        Transporte urbano
                    </span>
                    <h1>Muévete por Antofagasta sin perder el rumbo.</h1>
                    <p>Encuentra tu línea, revisa sus paraderos y organiza tus viajes desde una sola aplicación.</p>
                </div>

                <ul className="auth-highlights">
                    {highlights.map((item) => (
                        <li key={item.title}>
                            <span className="auth-highlight-icon">
                                <Icon name={item.icon} size={18} />
                            </span>
                            <span>
                                <strong>{item.title}</strong>
                                <small>{item.text}</small>
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="auth-route" aria-hidden="true">
                    <span className="auth-route-line" />
                    <span className="auth-route-stop is-start" />
                    <span className="auth-route-stop is-mid" />
                    <span className="auth-route-stop is-end">
                        <Icon name="bus" size={16} />
                    </span>
                </div>

                <p className="auth-aside-foot">
                    <Icon name="pin" size={14} />
                    Antofagasta, Chile
                </p>
            </aside>

            <main className="auth-main">
                <div className={`auth-card ${wide ? "is-wide" : ""}`.trim()}>
                    <Link className="auth-mobile-brand" to="/" aria-label="VoyBus, ir al inicio">
                        <Logo size={36} />
                    </Link>

                    <header className="auth-head">
                        <h2>{title}</h2>
                        {description && <p>{description}</p>}
                    </header>

                    {children}

                    {footer && <footer className="auth-footer">{footer}</footer>}
                </div>
            </main>
        </div>
    )
}
