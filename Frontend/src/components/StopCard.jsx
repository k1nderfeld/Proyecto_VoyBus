import { Link } from "react-router-dom"
import { FavoriteButton } from "./FavoriteButton"
import { Icon } from "./Icon"

export function StopCard({ stop, selected = false, onSelect }) {
    const lines = stop.lines || []

    return (
        <article className={`stop-card ${selected ? "is-selected" : ""}`.trim()}>
            <div className="stop-card-head">
                <span className="stop-code">
                    <Icon name="pin" size={14} />
                    {stop.code}
                </span>
                <FavoriteButton type="stops" item={stop} className="stop-card-favorite" />
            </div>

            <h3 className="stop-card-title">
                <Link
                    to={`/paraderos/${stop.id}`}
                    onClick={() => {
                        if (onSelect) onSelect(stop)
                    }}
                >
                    {stop.name}
                </Link>
            </h3>

            {lines.length ? (
                <div className="stop-lines">
                    {lines.slice(0, 6).map((line) => (
                        <span className="stop-line-chip" key={line.id} style={{ "--chip-color": line.color }}>
                            <span className="stop-line-dot" />
                            Línea {line.code}
                        </span>
                    ))}
                    {lines.length > 6 && <span className="stop-line-more">+{lines.length - 6}</span>}
                </div>
            ) : (
                <p className="stop-card-note">Paradero guardado en tus favoritos.</p>
            )}

            <div className="stop-card-footer">
                <span className="muted-small">
                    <Icon name="bus" size={15} />
                    {lines.length ? `${lines.length} ${lines.length === 1 ? "línea" : "líneas"}` : "Sin líneas asociadas"}
                </span>
                <Link className="text-link" to={`/paraderos/${stop.id}`}>
                    Ver paradero
                    <Icon name="arrow-right" size={15} />
                </Link>
            </div>
        </article>
    )
}
