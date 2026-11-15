import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api, queryString } from "../api/client"
import { SelectField, TextField } from "../components/Fields"
import { HistoryCard } from "../components/HistoryCard"
import { Icon } from "../components/Icon"
import { PageHeader } from "../components/PageHeader"
import { Pagination } from "../components/Pagination"
import { EmptyState, ErrorState, Skeleton } from "../components/States"
import { useApiData } from "../hooks/useApiData"
import { formatDate } from "../lib/format"

export function HistoryPage() {
    const [params, setParams] = useSearchParams()
    const from = params.get("from") || ""
    const to = params.get("to") || ""
    const lineId = params.get("lineId") || ""
    const page = Math.max(1, Number(params.get("page")) || 1)
    const [expanded, setExpanded] = useState(Boolean(from || to || lineId))

    const historyState = useApiData(
        ({ signal }) =>
            api
                .get(
                    `/users/me/history${queryString({
                        from: from || undefined,
                        to: to || undefined,
                        lineId: lineId || undefined,
                        page,
                        limit: 8
                    })}`,
                    { signal }
                )
                .then((response) => response.data),
        [from, to, lineId, page]
    )

    const linesState = useApiData(
        ({ signal }) => api.get("/lines?limit=50", { signal }).then((response) => response.data.items),
        []
    )

    const data = historyState.data
    const entries = data?.items || []
    const lines = linesState.data || []
    const hasFilters = Boolean(from || to || lineId)

    const updateParam = (key, value) => {
        setParams((current) => {
            const next = new URLSearchParams(current)
            if (value) next.set(key, value)
            else next.delete(key)
            next.delete("page")
            return next
        })
    }

    const clearFilters = () => {
        setParams((current) => {
            const next = new URLSearchParams(current)
            next.delete("from")
            next.delete("to")
            next.delete("lineId")
            next.delete("page")
            return next
        })
    }

    const changePage = (nextPage) => {
        setParams((current) => {
            const next = new URLSearchParams(current)
            if (nextPage > 1) next.set("page", String(nextPage))
            else next.delete("page")
            return next
        })
    }

    const withRequests = entries.filter((entry) => entry.request).length

    return (
        <div className="page">
            <PageHeader
                eyebrow="Mi cuenta"
                title="Historial de viajes"
                description="Revisa los viajes que registraste, la línea utilizada y las solicitudes de bajada asociadas."
                actions={
                    <button
                        type="button"
                        className={`button button-ghost button-small ${expanded ? "is-active" : ""}`.trim()}
                        onClick={() => setExpanded((current) => !current)}
                    >
                        <Icon name="sliders" size={16} />
                        {expanded ? "Ocultar filtros" : "Filtrar"}
                    </button>
                }
            />

            <div className={`filter-panel ${expanded ? "is-open" : ""}`.trim()}>
                <div className="filter-grid">
                    <TextField
                        label="Desde"
                        type="date"
                        icon="calendar"
                        value={from}
                        max={to || undefined}
                        onChange={(event) => updateParam("from", event.target.value)}
                    />
                    <TextField
                        label="Hasta"
                        type="date"
                        icon="calendar"
                        value={to}
                        min={from || undefined}
                        onChange={(event) => updateParam("to", event.target.value)}
                    />
                    <SelectField
                        label="Línea"
                        value={lineId}
                        onChange={(event) => updateParam("lineId", event.target.value)}
                    >
                        <option value="">Todas las líneas</option>
                        {lines.map((line) => (
                            <option key={line.id} value={line.id}>
                                {line.code} · {line.name}
                            </option>
                        ))}
                    </SelectField>
                    <div className="filter-actions">
                        <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                        >
                            <Icon name="refresh" size={15} />
                            Limpiar filtros
                        </button>
                    </div>
                </div>
                {hasFilters && (
                    <p className="filter-summary">
                        <Icon name="info" size={15} />
                        Mostrando viajes
                        {from && ` desde el ${formatDate(from)}`}
                        {to && ` hasta el ${formatDate(to)}`}
                        {lineId && ` de la línea ${lines.find((line) => String(line.id) === lineId)?.code || lineId}`}.
                    </p>
                )}
            </div>

            {!historyState.loading && !historyState.error && entries.length > 0 && (
                <div className="stat-strip">
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-violet">
                            <Icon name="history" size={18} />
                        </span>
                        <span>
                            <strong>{data.pagination.total}</strong>
                            <small>viajes registrados</small>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-blue">
                            <Icon name="pin" size={18} />
                        </span>
                        <span>
                            <strong>{withRequests}</strong>
                            <small>con solicitud de bajada</small>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon stat-icon-lilac">
                            <Icon name="calendar" size={18} />
                        </span>
                        <span>
                            <strong>{formatDate(entries[0].linkedAt)}</strong>
                            <small>viaje más reciente</small>
                        </span>
                    </div>
                </div>
            )}

            {data?.notice && (
                <div className="notice notice-info">
                    <span className="notice-icon">
                        <Icon name="info" size={19} />
                    </span>
                    <div>
                        <strong>Sobre las solicitudes de bajada</strong>
                        <p>{data.notice}</p>
                    </div>
                </div>
            )}

            {historyState.loading ? (
                <div className="history-list">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="history-card-skeleton" />
                    ))}
                </div>
            ) : historyState.error ? (
                <ErrorState message={historyState.error} onRetry={historyState.reload} />
            ) : entries.length ? (
                <>
                    <div className="history-list">
                        {entries.map((entry) => (
                            <HistoryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                    <Pagination pagination={data.pagination} onPage={changePage} noun="viajes" />
                </>
            ) : (
                <EmptyState
                    icon="history"
                    title={hasFilters ? "No hay viajes en este período" : "Todavía no registras viajes"}
                    description={
                        hasFilters
                            ? "Prueba con otro rango de fechas o quita los filtros para ver todo tu historial."
                            : "Cuando vincules un viaje en la aplicación, aparecerá aquí con su línea, recorrido y solicitudes."
                    }
                    action={
                        hasFilters ? (
                            <button type="button" className="button button-ghost button-small" onClick={clearFilters}>
                                Quitar filtros
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="button button-ghost button-small"
                                onClick={() => setExpanded(true)}
                            >
                                Revisar filtros
                            </button>
                        )
                    }
                />
            )}
        </div>
    )
}
