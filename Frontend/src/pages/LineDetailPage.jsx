import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../api/client"
import { EmptyState, ErrorState, Loader, Skeleton } from "../components/States"
import { FavoriteButton } from "../components/FavoriteButton"
import { Icon } from "../components/Icon"
import { LineCode } from "../components/LineCard"
import { PageHeader } from "../components/PageHeader"
import { RouteMap } from "../components/RouteMap"
import { ScheduleList } from "../components/ScheduleList"
import { useApiData } from "../hooks/useApiData"
import { distanceInMeters, formatDistance } from "../lib/geo"
import { statusLabel, statusTone } from "../lib/labels"

export function LineDetailPage() {
    const { lineId } = useParams()
    const [routeId, setRouteId] = useState(null)
    const [selectedStopId, setSelectedStopId] = useState(null)

    const lineState = useApiData(
        ({ signal }) => api.get(`/lines/${lineId}`, { signal }).then((response) => response.data),
        [lineId]
    )

    const line = lineState.data

    useEffect(() => {
        if (!line?.routes?.length) {
            setRouteId(null)
            return
        }

        setRouteId((current) => (line.routes.some((route) => route.id === current) ? current : line.routes[0].id))
    }, [line])

    const routeState = useApiData(
        ({ signal }) =>
            routeId
                ? api.get(`/lines/${lineId}/routes/${routeId}`, { signal }).then((response) => response.data)
                : Promise.resolve(null),
        [lineId, routeId]
    )

    const route = routeState.data

    useEffect(() => {
        if (!route?.stops?.length) {
            setSelectedStopId(null)
            return
        }

        setSelectedStopId((current) =>
            route.stops.some((stop) => stop.id === current) ? current : route.stops[0].id
        )
    }, [route])

    const totalDistance = useMemo(() => {
        if (!route?.path || route.path.length < 2) return 0

        return route.path.reduce(
            (total, point, index) => (index === 0 ? 0 : total + distanceInMeters(route.path[index - 1], point)),
            0
        )
    }, [route])

    if (lineState.loading) {
        return (
            <div className="page">
                <div className="detail-loading">
                    <Loader label="Cargando la línea" />
                    <Skeleton className="detail-hero-skeleton" />
                    <div className="detail-grid">
                        <Skeleton className="detail-panel-skeleton" />
                        <Skeleton className="detail-panel-skeleton" />
                    </div>
                </div>
            </div>
        )
    }

    if (lineState.error) {
        return (
            <div className="page">
                <PageHeader backTo="/lineas" title="Detalle de la línea" backLabel="Volver a líneas" />
                <ErrorState message={lineState.error} onRetry={lineState.reload} />
            </div>
        )
    }

    if (!line) {
        return (
            <div className="page">
                <PageHeader backTo="/lineas" title="Detalle de la línea" backLabel="Volver a líneas" />
                <EmptyState
                    icon="bus"
                    title="No encontramos esta línea"
                    description="Puede que ya no esté disponible o que el enlace no sea correcto."
                    action={
                        <Link className="button button-primary button-small" to="/lineas">
                            Ver todas las líneas
                        </Link>
                    }
                />
            </div>
        )
    }

    const selectedStop = route?.stops?.find((stop) => stop.id === selectedStopId)

    return (
        <div className="page line-detail">
            <PageHeader
                backTo="/lineas"
                backLabel="Volver a líneas"
                eyebrow={`Línea ${line.code}`}
                title={line.name}
                description={
                    line.origin && line.destination
                        ? `${line.origin.name} · ${line.destination.name}`
                        : "Consulta recorridos, paraderos y horarios."
                }
                actions={
                    <>
                        <span className={`pill pill-${statusTone(line.status)}`}>{statusLabel(line)}</span>
                        <FavoriteButton type="lines" item={line} label />
                    </>
                }
            />

            {line.notice && (
                <div className="notice notice-warning">
                    <span className="notice-icon">
                        <Icon name="alert" size={19} />
                    </span>
                    <div>
                        <strong>Servicio temporalmente suspendido</strong>
                        <p>{line.notice}</p>
                    </div>
                </div>
            )}

            <div className="line-summary">
                <div className="line-summary-code">
                    <LineCode line={line} />
                    <span>
                        <strong>Línea {line.code}</strong>
                        <small>
                            {line.routes.length} {line.routes.length === 1 ? "recorrido publicado" : "recorridos publicados"}
                        </small>
                    </span>
                </div>
                <div className="line-summary-meta">
                    {line.origin && (
                        <span className="summary-meta">
                            <Icon name="locate" size={16} />
                            {line.origin.name}
                        </span>
                    )}
                    {line.destination && (
                        <span className="summary-meta">
                            <Icon name="pin" size={16} />
                            {line.destination.name}
                        </span>
                    )}
                </div>
            </div>

            {line.routes.length ? (
                <>
                    <div className="route-tabs" role="tablist" aria-label="Recorridos de la línea">
                        {line.routes.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={item.id === routeId}
                                className={`route-tab ${item.id === routeId ? "is-active" : ""}`.trim()}
                                onClick={() => setRouteId(item.id)}
                            >
                                <span className="route-tab-icon">
                                    <Icon name={item.direction === "inbound" ? "swap" : "route"} size={17} />
                                </span>
                                <span>
                                    <strong>{item.directionLabel || "Recorrido"}</strong>
                                    <small>{item.name}</small>
                                </span>
                            </button>
                        ))}
                    </div>

                    {routeState.loading ? (
                        <div className="detail-grid">
                            <Skeleton className="detail-panel-skeleton" />
                            <Skeleton className="detail-panel-skeleton" />
                        </div>
                    ) : routeState.error ? (
                        <ErrorState message={routeState.error} onRetry={routeState.reload} />
                    ) : route ? (
                        <div className="detail-grid">
                            <div className="stack">
                                <section className="panel map-panel">
                                    <div className="panel-head">
                                        <span className="panel-icon">
                                            <Icon name="route" size={18} />
                                        </span>
                                        <div>
                                            <h2>{route.route.directionLabel || "Recorrido"} · {route.route.name}</h2>
                                            <p>Selecciona un punto del mapa o de la lista para ubicarlo.</p>
                                        </div>
                                    </div>

                                    <RouteMap
                                        stops={route.stops}
                                        path={route.path}
                                        selectedId={selectedStopId}
                                        onSelect={(point) => setSelectedStopId(point.id)}
                                    />

                                    {selectedStop && (
                                        <div className="map-selection">
                                            <span className="map-selection-order">{selectedStop.order}</span>
                                            <span className="map-selection-copy">
                                                <strong>{selectedStop.name}</strong>
                                                <small>{selectedStop.code}</small>
                                            </span>
                                            <Link className="text-link" to={`/paraderos/${selectedStop.id}`}>
                                                Ver paradero
                                                <Icon name="arrow-right" size={15} />
                                            </Link>
                                        </div>
                                    )}

                                    <div className="map-stats">
                                        <span>
                                            <Icon name="pin" size={16} />
                                            <strong>{route.stops.length}</strong> paraderos
                                        </span>
                                        <span>
                                            <Icon name="route" size={16} />
                                            <strong>{formatDistance(totalDistance)}</strong> de recorrido
                                        </span>
                                        <span>
                                            <Icon name="swap" size={16} />
                                            <strong>{route.route.directionLabel || "Recorrido"}</strong>
                                        </span>
                                    </div>
                                </section>

                                <section className="panel">
                                    <div className="panel-head">
                                        <span className="panel-icon">
                                            <Icon name="list" size={18} />
                                        </span>
                                        <div>
                                            <h2>Paraderos del recorrido</h2>
                                            <p>En el orden en que los recorre el servicio.</p>
                                        </div>
                                    </div>

                                    <ol className="route-stops">
                                        {route.stops.map((stop) => (
                                            <li
                                                key={stop.id}
                                                className={`route-stop ${stop.id === selectedStopId ? "is-active" : ""}`.trim()}
                                            >
                                                <button
                                                    type="button"
                                                    className="route-stop-main"
                                                    onClick={() => setSelectedStopId(stop.id)}
                                                >
                                                    <span className="route-stop-order">{stop.order}</span>
                                                    <span className="route-stop-copy">
                                                        <strong>{stop.name}</strong>
                                                        <small>{stop.code}</small>
                                                    </span>
                                                </button>
                                                <Link
                                                    className="icon-button"
                                                    to={`/paraderos/${stop.id}`}
                                                    aria-label={`Ver el paradero ${stop.name}`}
                                                >
                                                    <Icon name="chevron-right" size={17} />
                                                </Link>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            </div>

                            <aside className="stack">
                                <section className="panel">
                                    <div className="panel-head">
                                        <span className="panel-icon">
                                            <Icon name="clock" size={18} />
                                        </span>
                                        <div>
                                            <h2>Horarios</h2>
                                            <p>Funcionamiento del recorrido durante la semana.</p>
                                        </div>
                                    </div>
                                    <ScheduleList schedules={route.route.schedules} />
                                </section>

                                <section className="panel">
                                    <div className="panel-head">
                                        <span className="panel-icon">
                                            <Icon name="info" size={18} />
                                        </span>
                                        <div>
                                            <h2>Sobre este recorrido</h2>
                                            <p>Datos generales del servicio.</p>
                                        </div>
                                    </div>
                                    <dl className="detail-list">
                                        <div>
                                            <dt>Sentido</dt>
                                            <dd>{route.route.directionLabel || "Sin información"}</dd>
                                        </div>
                                        <div>
                                            <dt>Inicio</dt>
                                            <dd>{route.route.origin?.name || "Por confirmar"}</dd>
                                        </div>
                                        <div>
                                            <dt>Término</dt>
                                            <dd>{route.route.destination?.name || "Por confirmar"}</dd>
                                        </div>
                                        <div>
                                            <dt>Paraderos</dt>
                                            <dd>{route.stops.length}</dd>
                                        </div>
                                    </dl>
                                </section>
                            </aside>
                        </div>
                    ) : null}
                </>
            ) : (
                <EmptyState
                    icon="route"
                    title="Esta línea no tiene recorridos activos"
                    description="Cuando se publique un recorrido podrás revisar sus paraderos, horarios y trazado."
                    action={
                        <Link className="button button-ghost button-small" to="/lineas">
                            Ver otras líneas
                        </Link>
                    }
                />
            )}
        </div>
    )
}
