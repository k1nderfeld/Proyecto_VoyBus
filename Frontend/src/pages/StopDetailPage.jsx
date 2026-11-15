import { Link, useParams } from "react-router-dom"
import { api } from "../api/client"
import { FavoriteButton } from "../components/FavoriteButton"
import { Icon } from "../components/Icon"
import { LineCode } from "../components/LineCard"
import { PageHeader } from "../components/PageHeader"
import { RouteMap } from "../components/RouteMap"
import { EmptyState, ErrorState, Loader, Skeleton } from "../components/States"
import { useApiData } from "../hooks/useApiData"
import { mapsLink } from "../lib/geo"

export function StopDetailPage() {
    const { stopId } = useParams()

    const stopState = useApiData(
        ({ signal }) => api.get(`/stops/${stopId}`, { signal }).then((response) => response.data),
        [stopId]
    )

    const stop = stopState.data

    if (stopState.loading) {
        return (
            <div className="page">
                <div className="detail-loading">
                    <Loader label="Cargando el paradero" />
                    <Skeleton className="detail-hero-skeleton" />
                    <div className="detail-grid">
                        <Skeleton className="detail-panel-skeleton" />
                        <Skeleton className="detail-panel-skeleton" />
                    </div>
                </div>
            </div>
        )
    }

    if (stopState.error) {
        return (
            <div className="page">
                <PageHeader backTo="/paraderos" title="Detalle del paradero" backLabel="Volver a paraderos" />
                <ErrorState message={stopState.error} onRetry={stopState.reload} />
            </div>
        )
    }

    if (!stop) {
        return (
            <div className="page">
                <PageHeader backTo="/paraderos" title="Detalle del paradero" backLabel="Volver a paraderos" />
                <EmptyState
                    icon="pin"
                    title="No encontramos este paradero"
                    description="Puede que ya no esté disponible o que el enlace no sea correcto."
                    action={
                        <Link className="button button-primary button-small" to="/paraderos">
                            Ver todos los paraderos
                        </Link>
                    }
                />
            </div>
        )
    }

    const lines = stop.lines || []

    return (
        <div className="page">
            <PageHeader
                backTo="/paraderos"
                backLabel="Volver a paraderos"
                eyebrow={`Paradero ${stop.code}`}
                title={stop.name}
                description={`${stop.latitude.toFixed(5)}, ${stop.longitude.toFixed(5)} · Antofagasta`}
                actions={
                    <>
                        <FavoriteButton type="stops" item={stop} label />
                        <a
                            className="button button-ghost button-small"
                            href={mapsLink(stop)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon name="external" size={16} />
                            Cómo llegar
                        </a>
                    </>
                }
            />

            <div className="detail-grid">
                <div className="stack">
                    <section className="panel map-panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="locate" size={18} />
                            </span>
                            <div>
                                <h2>Ubicación del paradero</h2>
                                <p>Referencia esquemática dentro de la red de Antofagasta.</p>
                            </div>
                        </div>
                        <RouteMap stops={[stop]} selectedId={stop.id} />
                        <div className="map-selection">
                            <span className="map-selection-icon">
                                <Icon name="pin" size={18} />
                            </span>
                            <span className="map-selection-copy">
                                <strong>{stop.name}</strong>
                                <small>{stop.code}</small>
                            </span>
                            <a className="text-link" href={mapsLink(stop)} target="_blank" rel="noreferrer">
                                Abrir mapa
                                <Icon name="external" size={14} />
                            </a>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="bus" size={18} />
                            </span>
                            <div>
                                <h2>Líneas que pasan por aquí</h2>
                                <p>{lines.length ? `${lines.length} ${lines.length === 1 ? "línea conecta" : "líneas conectan"} este paradero con la ciudad.` : "Este paradero no tiene líneas asociadas por ahora."}</p>
                            </div>
                        </div>

                        {lines.length ? (
                            <div className="serving-lines">
                                {lines.map((line) => (
                                    <article className="serving-line" key={line.id} style={{ "--line-color": line.color }}>
                                        <div className="serving-line-head">
                                            <LineCode line={line} size="sm" />
                                            <div className="serving-line-copy">
                                                <Link to={`/lineas/${line.id}`}>{line.name}</Link>
                                                <small>{line.routes?.length || 0} recorridos</small>
                                            </div>
                                            <Link
                                                className="icon-button"
                                                to={`/lineas/${line.id}`}
                                                aria-label={`Ver la línea ${line.code}`}
                                            >
                                                <Icon name="chevron-right" size={17} />
                                            </Link>
                                        </div>
                                        {line.routes?.length ? (
                                            <div className="serving-routes">
                                                {line.routes.map((route) => (
                                                    <Link
                                                        className="serving-route"
                                                        key={route.id}
                                                        to={`/lineas/${line.id}`}
                                                    >
                                                        <Icon
                                                            name={route.direction === "inbound" ? "swap" : "route"}
                                                            size={14}
                                                        />
                                                        {route.directionLabel || "Recorrido"}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : null}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="route"
                                title="Sin líneas asociadas"
                                description="Puedes seguir revisando otros paraderos de la red."
                                action={
                                    <Link className="button button-ghost button-small" to="/paraderos">
                                        Ver paraderos
                                    </Link>
                                }
                            />
                        )}
                    </section>
                </div>

                <aside className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="info" size={18} />
                            </span>
                            <div>
                                <h2>Datos del paradero</h2>
                                <p>Información de referencia.</p>
                            </div>
                        </div>
                        <dl className="detail-list">
                            <div>
                                <dt>Código</dt>
                                <dd>{stop.code}</dd>
                            </div>
                            <div>
                                <dt>Latitud</dt>
                                <dd>{stop.latitude.toFixed(5)}</dd>
                            </div>
                            <div>
                                <dt>Longitud</dt>
                                <dd>{stop.longitude.toFixed(5)}</dd>
                            </div>
                            <div>
                                <dt>Líneas</dt>
                                <dd>{lines.length}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="panel tip-panel">
                        <span className="tip-icon">
                            <Icon name="sparkles" size={20} />
                        </span>
                        <h3>Guarda este paradero</h3>
                        <p>Agrégalo a tus favoritos para encontrarlo al instante cuando planifiques tu próximo viaje.</p>
                        <FavoriteButton type="stops" item={stop} label />
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="route" size={18} />
                            </span>
                            <div>
                                <h2>Otros accesos</h2>
                                <p>Continúa explorando la red.</p>
                            </div>
                        </div>
                        <div className="panel-links">
                            <Link to="/lineas">
                                <Icon name="bus" size={17} />
                                Líneas y recorridos
                                <Icon name="chevron-right" size={16} />
                            </Link>
                            <Link to="/paraderos">
                                <Icon name="pin" size={17} />
                                Todos los paraderos
                                <Icon name="chevron-right" size={16} />
                            </Link>
                            <Link to="/favoritos">
                                <Icon name="heart" size={17} />
                                Mis favoritos
                                <Icon name="chevron-right" size={16} />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
