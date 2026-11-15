import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api, queryString } from "../api/client"
import { FavoriteButton } from "../components/FavoriteButton"
import { Icon } from "../components/Icon"
import { PageHeader } from "../components/PageHeader"
import { Pagination } from "../components/Pagination"
import { RouteMap } from "../components/RouteMap"
import { SearchBar } from "../components/SearchBar"
import { EmptyState, ErrorState, Skeleton } from "../components/States"
import { StopCard } from "../components/StopCard"
import { useApiData, useDebounced } from "../hooks/useApiData"

export function StopsPage() {
    const [params, setParams] = useSearchParams()
    const q = params.get("q") || ""
    const page = Math.max(1, Number(params.get("page")) || 1)
    const [query, setQuery] = useState(q)
    const [selectedId, setSelectedId] = useState(null)
    const term = query.trim()
    const debounced = useDebounced(term, 350)

    useEffect(() => {
        if (debounced === q) return

        setParams(
            (current) => {
                const next = new URLSearchParams(current)
                if (debounced) next.set("q", debounced)
                else next.delete("q")
                next.delete("page")
                return next
            },
            { replace: true }
        )
    }, [debounced, q, setParams])

    useEffect(() => {
        setQuery(q)
    }, [q])

    const stopsState = useApiData(
        ({ signal }) =>
            api
                .get(`/stops${queryString({ search: q || undefined, page, limit: 12 })}`, { signal })
                .then((response) => response.data),
        [q, page]
    )

    const data = stopsState.data
    const stops = data?.items || []

    useEffect(() => {
        if (!stops.length) {
            setSelectedId(null)
            return
        }

        setSelectedId((current) => (stops.some((stop) => stop.id === current) ? current : stops[0].id))
    }, [data])

    const selected = stops.find((stop) => stop.id === selectedId)

    const changePage = (nextPage) => {
        setParams((current) => {
            const next = new URLSearchParams(current)
            if (nextPage > 1) next.set("page", String(nextPage))
            else next.delete("page")
            return next
        })
    }

    return (
        <div className="page">
            <PageHeader
                eyebrow="Red de transporte"
                title="Paraderos"
                description="Ubica los puntos de la red, revisa las líneas que pasan por cada uno y guarda los que más uses."
            />

            <div className="toolbar">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Busca por código o nombre de paradero"
                    ariaLabel="Buscar paraderos"
                />
                <div className="toolbar-meta">
                    <span className="result-count">
                        <strong>{data ? data.pagination.total : "—"}</strong> paraderos
                    </span>
                    {q && (
                        <button type="button" className="chip-button" onClick={() => setQuery("")}>
                            <Icon name="close" size={14} />
                            {q}
                        </button>
                    )}
                </div>
            </div>

            {stopsState.loading ? (
                <div className="stops-layout">
                    <div className="stops-grid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="stop-card-skeleton" />
                        ))}
                    </div>
                    <Skeleton className="stops-map-skeleton" />
                </div>
            ) : stopsState.error ? (
                <ErrorState message={stopsState.error} onRetry={stopsState.reload} />
            ) : stops.length ? (
                <>
                    <div className="stops-layout">
                        <div className="stops-grid">
                            {stops.map((stop) => (
                                <StopCard
                                    key={stop.id}
                                    stop={stop}
                                    selected={stop.id === selectedId}
                                    onSelect={(item) => setSelectedId(item.id)}
                                />
                            ))}
                        </div>

                        <aside className="stops-map-panel">
                            <div className="panel map-panel">
                                <div className="panel-head">
                                    <span className="panel-icon">
                                        <Icon name="locate" size={18} />
                                    </span>
                                    <div>
                                        <h2>Mapa de paraderos</h2>
                                        <p>Toca un punto para revisar su información.</p>
                                    </div>
                                </div>

                                <RouteMap
                                    stops={stops}
                                    selectedId={selectedId}
                                    onSelect={(point) => setSelectedId(point.id)}
                                    compact
                                />

                                {selected && (
                                    <div className="map-selection">
                                        <span className="map-selection-icon">
                                            <Icon name="pin" size={18} />
                                        </span>
                                        <span className="map-selection-copy">
                                            <strong>{selected.name}</strong>
                                            <small>{selected.code}</small>
                                        </span>
                                        <FavoriteButton type="stops" item={selected} />
                                    </div>
                                )}

                                {selected && (
                                    <div className="map-selection-lines">
                                        <span className="muted-small">
                                            <Icon name="bus" size={15} />
                                            Líneas que pasan aquí
                                        </span>
                                        <div className="stop-lines">
                                            {(selected.lines || []).map((line) => (
                                                <span
                                                    className="stop-line-chip"
                                                    key={line.id}
                                                    style={{ "--chip-color": line.color }}
                                                >
                                                    <span className="stop-line-dot" />
                                                    Línea {line.code}
                                                </span>
                                            ))}
                                            {!selected.lines?.length && (
                                                <span className="muted-small">Sin líneas asociadas.</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selected && (
                                    <Link className="button button-primary button-small button-block" to={`/paraderos/${selected.id}`}>
                                        Ver detalle del paradero
                                        <Icon name="arrow-right" size={16} />
                                    </Link>
                                )}
                            </div>
                        </aside>
                    </div>
                    <Pagination pagination={data.pagination} onPage={changePage} noun="paraderos" />
                </>
            ) : (
                <EmptyState
                    icon="pin"
                    title={q ? "No encontramos paraderos con ese criterio" : "Todavía no hay paraderos publicados"}
                    description={
                        q
                            ? "Prueba con otro código o nombre. También puedes revisar todas las líneas de la red."
                            : "Cuando la red esté disponible verás aquí todos sus puntos."
                    }
                    action={
                        q ? (
                            <button type="button" className="button button-ghost button-small" onClick={() => setQuery("")}>
                                Ver todos los paraderos
                            </button>
                        ) : (
                            <Link className="button button-ghost button-small" to="/lineas">
                                Explorar líneas
                            </Link>
                        )
                    }
                />
            )}
        </div>
    )
}
