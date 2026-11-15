import { Link } from "react-router-dom"
import { formatDate, formatDuration, formatRelative, formatTime } from "../lib/format"
import { LineCode } from "./LineCard"
import { Icon } from "./Icon"

export function HistoryCard({ entry }) {
    const requestedStop = entry.requestedStop
    const request = entry.request

    return (
        <article className="history-card">
            <div className="history-card-head">
                <div className="history-line">
                    <LineCode line={entry.line} size="sm" />
                    <div>
                        <h3>{entry.line.name}</h3>
                        <p>
                            {entry.route.directionLabel || "Recorrido"} · {entry.route.name}
                        </p>
                    </div>
                </div>
                <span className="history-date">{formatRelative(entry.linkedAt)}</span>
            </div>

            <div className="history-timeline">
                <span className="history-time">
                    <Icon name="clock" size={15} />
                    {formatDate(entry.linkedAt)} · {formatTime(entry.linkedAt)} – {formatTime(entry.endedAt)}
                </span>
                <span className="history-duration">{formatDuration(entry.linkedAt, entry.endedAt)}</span>
            </div>

            <div className="history-card-body">
                <div>
                    <span className="history-label">Paradero solicitado</span>
                    <span className="history-value">{requestedStop ? `${requestedStop.code} · ${requestedStop.name}` : "Sin solicitud de bajada"}</span>
                </div>
                <div>
                    <span className="history-label">Cierre de la solicitud</span>
                    <span className="history-value">{request?.closeReasonLabel || entry.endReasonLabel || "Sin registro"}</span>
                </div>
            </div>

            <div className="history-card-footer">
                {request?.statusLabel ? (
                    <span className={`pill pill-${request.status === "closed" ? "neutral" : "info"}`}>{request.statusLabel}</span>
                ) : (
                    <span className="pill pill-neutral">Sin solicitud</span>
                )}
                <Link className="text-link" to={`/historial/${entry.id}`}>
                    Ver detalle
                    <Icon name="arrow-right" size={15} />
                </Link>
            </div>
        </article>
    )
}
