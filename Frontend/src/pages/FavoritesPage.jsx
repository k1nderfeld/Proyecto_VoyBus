import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Icon } from "../components/Icon"
import { LineCard } from "../components/LineCard"
import { PageHeader } from "../components/PageHeader"
import { SearchBar } from "../components/SearchBar"
import { CardSkeletons, EmptyState, ErrorState } from "../components/States"
import { StopCard } from "../components/StopCard"
import { useFavorites } from "../context/FavoritesContext"
import { formatRelative } from "../lib/format"

export function FavoritesPage() {
    const { lines, stops, loading, error, refresh } = useFavorites()
    const [tab, setTab] = useState("lines")
    const [query, setQuery] = useState("")

    const term = query.trim().toLowerCase()
    const filteredLines = useMemo(
        () =>
            lines.filter(
                (line) =>
                    !term ||
                    line.code.toLowerCase().includes(term) ||
                    line.name.toLowerCase().includes(term)
            ),
        [lines, term]
    )
    const filteredStops = useMemo(
        () =>
            stops.filter(
                (stop) =>
                    !term ||
                    stop.code.toLowerCase().includes(term) ||
                    stop.name.toLowerCase().includes(term)
            ),
        [stops, term]
    )

    const total = lines.length + stops.length
    const visible = tab === "lines" ? filteredLines : filteredStops
    const latest = useMemo(() => {
        const saved = [...lines, ...stops].map((item) => item.savedAt).filter(Boolean)
        if (!saved.length) return null
        return saved.sort((a, b) => new Date(b) - new Date(a))[0]
    }, [lines, stops])

    return (
        <div className="page">
            <PageHeader
                eyebrow="Mi cuenta"
                title="Mis favoritos"
                description="Las líneas y paraderos que guardaste para tenerlos siempre a mano."
                actions={
                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <Icon name="refresh" size={16} />
                        Actualizar
                    </button>
                }
            />

            {total > 0 && (
                <div className="stat-strip">
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-violet">
                            <Icon name="heart" size={18} />
                        </span>
                        <span>
                            <strong>{total}</strong>
                            <small>favoritos guardados</small>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-blue">
                            <Icon name="bus" size={18} />
                        </span>
                        <span>
                            <strong>{lines.length}</strong>
                            <small>líneas guardadas</small>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-lilac">
                            <Icon name="pin" size={18} />
                        </span>
                        <span>
                            <strong>{stops.length}</strong>
                            <small>paraderos guardados</small>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-navy">
                            <Icon name="clock" size={18} />
                        </span>
                        <span>
                            <strong>{latest ? formatRelative(latest) : "—"}</strong>
                            <small>último guardado</small>
                        </span>
                    </div>
                </div>
            )}

            {total > 0 && (
                <div className="toolbar">
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        placeholder="Filtrar tus favoritos"
                        ariaLabel="Filtrar favoritos"
                    />
                    <div className="segmented" role="tablist" aria-label="Tipo de favorito">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === "lines"}
                            className={tab === "lines" ? "is-active" : ""}
                            onClick={() => setTab("lines")}
                        >
                            <Icon name="bus" size={16} />
                            Líneas
                            <span className="segmented-count">{lines.length}</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === "stops"}
                            className={tab === "stops" ? "is-active" : ""}
                            onClick={() => setTab("stops")}
                        >
                            <Icon name="pin" size={16} />
                            Paraderos
                            <span className="segmented-count">{stops.length}</span>
                        </button>
                    </div>
                </div>
            )}

            {loading && !total ? (
                <CardSkeletons count={4} />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : total === 0 ? (
                <EmptyState
                    icon="heart"
                    title="Todavía no tienes favoritos"
                    description="Guarda las líneas y paraderos que más usas. Los encontrarás aquí cada vez que los necesites."
                    action={
                        <div className="empty-actions">
                            <Link className="button button-primary button-small" to="/lineas">
                                Explorar líneas
                            </Link>
                            <Link className="button button-ghost button-small" to="/paraderos">
                                Ver paraderos
                            </Link>
                        </div>
                    }
                />
            ) : visible.length ? (
                <div className="card-grid">
                    {tab === "lines"
                        ? visible.map((line) => <LineCard key={line.id} line={line} />)
                        : visible.map((stop) => <StopCard key={stop.id} stop={stop} />)}
                </div>
            ) : (
                <div className="filtered-empty">
                    <EmptyState
                        icon={tab === "lines" ? "bus" : "pin"}
                        title={term ? "Ningún favorito coincide con tu búsqueda" : `Aún no guardas ${tab === "lines" ? "líneas" : "paraderos"}`}
                        description={
                            term
                                ? "Prueba con otro código o nombre."
                                : `Puedes guardar ${tab === "lines" ? "una línea" : "un paradero"} desde su ficha usando el ícono del corazón.`
                        }
                        action={
                            <Link
                                className="button button-ghost button-small"
                                to={tab === "lines" ? "/lineas" : "/paraderos"}
                            >
                                Explorar {tab === "lines" ? "líneas" : "paraderos"}
                            </Link>
                        }
                    />
                </div>
            )}
        </div>
    )
}
