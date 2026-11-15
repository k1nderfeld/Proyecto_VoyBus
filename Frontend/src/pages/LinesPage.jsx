import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api, queryString } from "../api/client"
import { Icon } from "../components/Icon"
import { LineCard } from "../components/LineCard"
import { PageHeader } from "../components/PageHeader"
import { Pagination } from "../components/Pagination"
import { SearchBar } from "../components/SearchBar"
import { CardSkeletons, EmptyState, ErrorState } from "../components/States"
import { useApiData, useDebounced } from "../hooks/useApiData"

export function LinesPage() {
    const [params, setParams] = useSearchParams()
    const q = params.get("q") || ""
    const page = Math.max(1, Number(params.get("page")) || 1)
    const [query, setQuery] = useState(q)
    const [view, setView] = useState("grid")
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

    const linesState = useApiData(
        ({ signal }) =>
            api
                .get(`/lines${queryString({ search: q || undefined, page, limit: 12 })}`, { signal })
                .then((response) => response.data),
        [q, page]
    )

    const data = linesState.data
    const lines = data?.items || []

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
                title="Líneas y recorridos"
                description="Revisa los recorridos activos de Antofagasta, sus paraderos y horarios de funcionamiento."
                actions={
                    <div className="view-switch" role="group" aria-label="Vista de resultados">
                        <button
                            type="button"
                            className={view === "grid" ? "is-active" : ""}
                            onClick={() => setView("grid")}
                            aria-label="Ver como tarjetas"
                            aria-pressed={view === "grid"}
                        >
                            <Icon name="grid" size={17} />
                        </button>
                        <button
                            type="button"
                            className={view === "list" ? "is-active" : ""}
                            onClick={() => setView("list")}
                            aria-label="Ver como lista"
                            aria-pressed={view === "list"}
                        >
                            <Icon name="list" size={17} />
                        </button>
                    </div>
                }
            />

            <div className="toolbar">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Busca por código, nombre o destino"
                    ariaLabel="Buscar líneas"
                />
                <div className="toolbar-meta">
                    <span className="result-count">
                        <strong>{data ? data.pagination.total : "—"}</strong> líneas
                    </span>
                    {q && (
                        <button type="button" className="chip-button" onClick={() => setQuery("")}>
                            <Icon name="close" size={14} />
                            {q}
                        </button>
                    )}
                </div>
            </div>

            {linesState.loading ? (
                <CardSkeletons count={6} />
            ) : linesState.error ? (
                <ErrorState message={linesState.error} onRetry={linesState.reload} />
            ) : lines.length ? (
                <>
                    <div className={`card-grid ${view === "list" ? "is-list" : ""}`.trim()}>
                        {lines.map((line) => (
                            <LineCard key={line.id} line={line} />
                        ))}
                    </div>
                    <Pagination pagination={data.pagination} onPage={changePage} noun="líneas" />
                </>
            ) : (
                <EmptyState
                    icon="bus"
                    title={q ? "No encontramos líneas con ese criterio" : "Todavía no hay líneas publicadas"}
                    description={
                        q
                            ? "Prueba con otro código, nombre de línea o destino."
                            : "Cuando la red esté disponible verás aquí todos sus recorridos."
                    }
                    action={
                        q ? (
                            <button type="button" className="button button-ghost button-small" onClick={() => setQuery("")}>
                                Ver todas las líneas
                            </button>
                        ) : null
                    }
                />
            )}
        </div>
    )
}
