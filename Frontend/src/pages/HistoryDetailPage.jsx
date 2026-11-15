import { Link, useParams } from "react-router-dom"
import { api } from "../api/client"
import { Icon } from "../components/Icon"
import { LineCode } from "../components/LineCard"
import { PageHeader } from "../components/PageHeader"
import { EmptyState, ErrorState, Loader, Skeleton } from "../components/States"
import { useApiData } from "../hooks/useApiData"
import { formatDateTime, formatDuration, formatRelative, formatTime, methodLabel } from "../lib/format"

export function HistoryDetailPage() {
    const { entryId } = useParams()

    const entryState = useApiData(
        ({ signal }) => api.get(`/users/me/history/${entryId}`, { signal }).then((response) => response.data),
        [entryId]
    )

    const entry = entryState.data

    if (entryState.loading) {
        return (
            <div className="page">
                <div className="detail-loading">
                    <Loader label="Cargando el viaje" />
                    <Skeleton className="detail-hero-skeleton" />
                    <div className="detail-grid">
                        <Skeleton className="detail-panel-skeleton" />
                        <Skeleton className="detail-panel-skeleton" />
                    </div>
                </div>
            </div>
        )
    }

    if (entryState.error) {
        return (
            <div className="page">
                <PageHeader backTo="/historial" title="Detalle del viaje" backLabel="Volver al historial" />
                <ErrorState message={entryState.error} onRetry={entryState.reload} />
            </div>
        )
    }

    if (!entry) {
        return (
            <div className="page">
                <PageHeader backTo="/historial" title="Detalle del viaje" backLabel="Volver al historial" />
                <EmptyState
                    icon="history"
                    title="No encontramos este viaje"
                    description="Puede que el registro ya no esté disponible."
                    action={
                        <Link className="button button-primary button-small" to="/historial">
                            Ver mi historial
                        </Link>
                    }
                />
            </div>
        )
    }

    const requests = entry.requests || []
    const latestStop = entry.requestedStop

    return (
        <div className="page">
            <PageHeader
                backTo="/historial"
                backLabel="Volver al historial"
                eyebrow={`Viaje del ${formatDateTime(entry.linkedAt)}`}
                title={entry.line.name}
                description={`${entry.route.directionLabel || "Recorrido"} · ${entry.route.name}`}
                actions={
                    <Link className="button button-ghost button-small" to={`/lineas/${entry.line.id}`}>
                        <Icon name="bus" size={16} />
                        Ver línea
                    </Link>
                }
            />

            <div className="detail-grid">
                <div className="stack">
                    <section className="panel">
                        <div className="trip-head">
                            <LineCode line={entry.line} />
                            <div className="trip-head-copy">
                                <span className="eyebrow">Línea {entry.line.code}</span>
                                <h2>{entry.line.name}</h2>
                                <p>{entry.route.name}</p>
                            </div>
                            <span className="pill pill-info">{entry.route.directionLabel || "Recorrido"}</span>
                        </div>

                        <div className="trip-meta-grid">
                            <div className="trip-meta">
                                <span className="trip-meta-icon">
                                    <Icon name="calendar" size={17} />
                                </span>
                                <span>
                                    <small>Fecha</small>
                                    <strong>{formatDateTime(entry.linkedAt)}</strong>
                                </span>
                            </div>
                            <div className="trip-meta">
                                <span className="trip-meta-icon">
                                    <Icon name="clock" size={17} />
                                </span>
                                <span>
                                    <small>Duración vinculado</small>
                                    <strong>{formatDuration(entry.linkedAt, entry.endedAt)}</strong>
                                </span>
                            </div>
                            <div className="trip-meta">
                                <span className="trip-meta-icon">
                                    <Icon name={entry.method === "qr" ? "qr" : "phone"} size={17} />
                                </span>
                                <span>
                                    <small>Método de vinculación</small>
                                    <strong>{methodLabel(entry.method)}</strong>
                                </span>
                            </div>
                            <div className="trip-meta">
                                <span className="trip-meta-icon">
                                    <Icon name="logout" size={17} />
                                </span>
                                <span>
                                    <small>Fin de la vinculación</small>
                                    <strong>{entry.endReasonLabel || "Sin registro"}</strong>
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="route" size={18} />
                            </span>
                            <div>
                                <h2>Línea de tiempo</h2>
                                <p>Momentos registrados durante el viaje.</p>
                            </div>
                        </div>

                        <ol className="trip-timeline">
                            <li>
                                <span className="timeline-dot is-violet">
                                    <Icon name="link" size={15} />
                                </span>
                                <div>
                                    <strong>Vinculación al vehículo</strong>
                                    <p>{formatDateTime(entry.linkedAt)}</p>
                                </div>
                            </li>
                            {entry.trip?.startedAt && (
                                <li>
                                    <span className="timeline-dot is-blue">
                                        <Icon name="bus" size={15} />
                                    </span>
                                    <div>
                                        <strong>Inicio del viaje del vehículo</strong>
                                        <p>{formatDateTime(entry.trip.startedAt)}</p>
                                    </div>
                                </li>
                            )}
                            {requests.map((request) => (
                                <li key={request.id}>
                                    <span className="timeline-dot is-lilac">
                                        <Icon name="pin" size={15} />
                                    </span>
                                    <div>
                                        <strong>Solicitud en {request.stop.name}</strong>
                                        <p>
                                            {formatTime(request.requestedAt)}
                                            {request.closedAt ? ` · cerrada a las ${formatTime(request.closedAt)}` : ""}
                                        </p>
                                    </div>
                                </li>
                            ))}
                            {entry.trip?.endedAt && (
                                <li>
                                    <span className="timeline-dot is-navy">
                                        <Icon name="flag" size={15} />
                                    </span>
                                    <div>
                                        <strong>Fin del viaje del vehículo</strong>
                                        <p>{formatDateTime(entry.trip.endedAt)}</p>
                                    </div>
                                </li>
                            )}
                            <li>
                                <span className="timeline-dot is-neutral">
                                    <Icon name="logout" size={15} />
                                </span>
                                <div>
                                    <strong>Fin de la vinculación</strong>
                                    <p>
                                        {formatDateTime(entry.endedAt)} · {entry.endReasonLabel || "Sin registro"}
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="pin" size={18} />
                            </span>
                            <div>
                                <h2>Solicitudes de bajada</h2>
                                <p>
                                    {requests.length
                                        ? `${requests.length} ${requests.length === 1 ? "solicitud registrada" : "solicitudes registradas"} en este viaje.`
                                        : "No registraste solicitudes de bajada en este viaje."}
                                </p>
                            </div>
                        </div>

                        {requests.length ? (
                            <div className="request-list">
                                {requests.map((request) => (
                                    <article className="request-card" key={request.id}>
                                        <div className="request-head">
                                            <span className="request-stop-icon">
                                                <Icon name="pin" size={17} />
                                            </span>
                                            <div className="request-copy">
                                                <strong>{request.stop.name}</strong>
                                                <small>{request.stop.code}</small>
                                            </div>
                                            <span
                                                className={`pill pill-${request.status === "closed" ? "neutral" : "info"}`}
                                            >
                                                {request.statusLabel || request.status}
                                            </span>
                                        </div>
                                        <div className="request-meta">
                                            <span>
                                                <Icon name="clock" size={14} />
                                                Solicitada {formatRelative(request.requestedAt)}
                                            </span>
                                            {request.closedAt && (
                                                <span>
                                                    <Icon name="check" size={14} />
                                                    Cerrada {formatRelative(request.closedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {request.closeReasonLabel && (
                                            <p className="request-reason">
                                                <Icon name="info" size={14} />
                                                {request.closeReasonLabel}
                                            </p>
                                        )}
                                        <Link className="text-link" to={`/paraderos/${request.stop.id}`}>
                                            Ver paradero
                                            <Icon name="arrow-right" size={14} />
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="panel-empty">
                                <Icon name="pin" size={20} />
                                <p>Este viaje no tiene solicitudes de bajada registradas.</p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="bus" size={18} />
                            </span>
                            <div>
                                <h2>Vehículo</h2>
                                <p>Unidad en la que se registró el viaje.</p>
                            </div>
                        </div>
                        <dl className="detail-list">
                            <div>
                                <dt>Código</dt>
                                <dd>{entry.vehicle?.code || "Sin registro"}</dd>
                            </div>
                            <div>
                                <dt>Patente</dt>
                                <dd>{entry.vehicle?.plate || "Sin registro"}</dd>
                            </div>
                            <div>
                                <dt>Duración del viaje</dt>
                                <dd>{formatDuration(entry.trip?.startedAt, entry.trip?.endedAt)}</dd>
                            </div>
                            <div>
                                <dt>Identificador</dt>
                                <dd>#{entry.id}</dd>
                            </div>
                        </dl>
                    </section>

                    {latestStop && (
                        <section className="panel">
                            <div className="panel-head">
                                <span className="panel-icon">
                                    <Icon name="pin" size={18} />
                                </span>
                                <div>
                                    <h2>Paradero solicitado</h2>
                                    <p>El último punto de bajada que indicaste.</p>
                                </div>
                            </div>
                            <div className="requested-stop">
                                <span className="requested-stop-icon">
                                    <Icon name="pin" size={20} />
                                </span>
                                <div>
                                    <strong>{latestStop.name}</strong>
                                    <small>{latestStop.code}</small>
                                </div>
                            </div>
                            <Link className="button button-ghost button-small button-block" to={`/paraderos/${latestStop.id}`}>
                                Ver paradero
                                <Icon name="arrow-right" size={15} />
                            </Link>
                        </section>
                    )}

                    <div className="notice notice-info">
                        <span className="notice-icon">
                            <Icon name="info" size={19} />
                        </span>
                        <div>
                            <strong>Importante</strong>
                            <p>{entry.notice}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
