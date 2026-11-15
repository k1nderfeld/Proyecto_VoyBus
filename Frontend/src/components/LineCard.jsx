import { Link } from "react-router-dom"
import { statusLabel, statusTone } from "../lib/labels"
import { FavoriteButton } from "./FavoriteButton"
import { Icon } from "./Icon"

export function LineCode({ line, size = "md" }) {
    return (
        <span className={`line-code line-code-${size}`} style={{ background: line.color || "var(--violet)" }}>
            {line.code}
        </span>
    )
}

export function LineCard({ line, compact = false }) {
    const hasEndpoints = line.origin || line.destination

    return (
        <article className={`line-card ${compact ? "is-compact" : ""}`.trim()} style={{ "--line-color": line.color || "#6B45FD" }}>
            <div className="line-card-head">
                <LineCode line={line} />
                <span className={`pill pill-${statusTone(line.status)}`}>{statusLabel(line)}</span>
                <FavoriteButton type="lines" item={line} className="line-card-favorite" />
            </div>

            <h3 className="line-card-title">
                <Link to={`/lineas/${line.id}`}>{line.name}</Link>
            </h3>

            {hasEndpoints ? (
                <div className="line-endpoints">
                    <span className="endpoint">
                        <span className="endpoint-dot" />
                        <span>{line.origin?.name || "Origen por confirmar"}</span>
                    </span>
                    <span className="endpoint-trail" />
                    <span className="endpoint">
                        <span className="endpoint-dot is-end" />
                        <span>{line.destination?.name || "Destino por confirmar"}</span>
                    </span>
                </div>
            ) : (
                <p className="line-card-note">
                    {line.notice || "Consulta los recorridos, paraderos y horarios de esta línea."}
                </p>
            )}

            <div className="line-card-footer">
                <span className="line-card-meta">
                    <Icon name="route" size={15} />
                    {line.routes?.length ? `${line.routes.length} recorridos` : "Recorridos y horarios"}
                </span>
                <Link className="text-link" to={`/lineas/${line.id}`}>
                    Ver línea
                    <Icon name="arrow-right" size={15} />
                </Link>
            </div>
        </article>
    )
}
