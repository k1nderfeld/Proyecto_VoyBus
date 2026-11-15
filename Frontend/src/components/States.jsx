import { Link } from "react-router-dom"
import { Icon } from "./Icon"

export function Loader({ label = "Cargando información" }) {
    return (
        <div className="loader" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>{label}</span>
        </div>
    )
}

export function Skeleton({ className = "", style }) {
    return <span className={`skeleton ${className}`.trim()} style={style} aria-hidden="true" />
}

export function CardSkeletons({ count = 4 }) {
    return (
        <div className="card-grid" aria-hidden="true">
            {Array.from({ length: count }).map((_, index) => (
                <div className="card skeleton-card" key={index}>
                    <div className="skeleton-row">
                        <Skeleton className="skeleton-badge" />
                        <Skeleton className="skeleton-pill" />
                    </div>
                    <Skeleton className="skeleton-title" />
                    <Skeleton className="skeleton-line" />
                    <Skeleton className="skeleton-line short" />
                    <Skeleton className="skeleton-footer" />
                </div>
            ))}
        </div>
    )
}

export function EmptyState({ icon = "search", title, description, action }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">
                <Icon name={icon} size={26} />
            </span>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            {action && <div className="empty-action">{action}</div>}
        </div>
    )
}

export function ErrorState({ message, onRetry, title = "Algo no salió como esperábamos" }) {
    return (
        <div className="error-state" role="alert">
            <span className="error-icon">
                <Icon name="alert" size={24} />
            </span>
            <div>
                <h3>{title}</h3>
                <p>{message}</p>
            </div>
            {onRetry && (
                <button type="button" className="button button-ghost button-small" onClick={onRetry}>
                    <Icon name="refresh" size={16} />
                    Reintentar
                </button>
            )}
        </div>
    )
}

export function LoginPrompt({ title = "Inicia sesión para continuar", description, next }) {
    return (
        <div className="login-prompt">
            <span className="login-prompt-icon">
                <Icon name="lock" size={22} />
            </span>
            <div>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
            </div>
            <Link className="button button-primary button-small" to={`/login?next=${encodeURIComponent(next || "/")}`}>
                Iniciar sesión
            </Link>
        </div>
    )
}
