import { Icon } from "./Icon"

export function Pagination({ pagination, onPage, noun = "resultados" }) {
    if (!pagination || pagination.totalPages <= 1) return null

    const { page, totalPages, total, limit } = pagination
    const from = (page - 1) * limit + 1
    const to = Math.min(page * limit, total)

    return (
        <nav className="pagination" aria-label="Paginación">
            <p className="pagination-info">
                <strong>
                    {from}–{to}
                </strong>{" "}
                de {total} {noun}
            </p>
            <div className="pagination-controls">
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => onPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Página anterior"
                >
                    <Icon name="chevron-left" size={18} />
                </button>
                <span className="pagination-page">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Página siguiente"
                >
                    <Icon name="chevron-right" size={18} />
                </button>
            </div>
        </nav>
    )
}
