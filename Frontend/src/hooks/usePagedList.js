import { useCallback, useEffect, useRef, useState } from "react"

const initialState = { key: null, items: [], page: 0, totalPages: 0, total: 0, error: null, loadingMore: false, moreError: null }

// Lista con carga progresiva (RNF-05): trae la página 1 y suma las siguientes al llegar al final.
// fetchPage({ page, signal }) debe devolver { items, pagination } como responde el backend.
// Vuelve a empezar cuando cambian las deps (por ejemplo el texto buscado) o al llamar a refresh().
export function usePagedList(fetchPage, deps = []) {
    const fetchRef = useRef(fetchPage)
    const [version, setVersion] = useState(0)
    const [state, setState] = useState(initialState)

    useEffect(() => {
        fetchRef.current = fetchPage
    })

    const baseKey = JSON.stringify(deps)
    const key = `${baseKey}#${version}`

    useEffect(() => {
        let active = true
        const controller = new AbortController()

        fetchRef.current({ page: 1, signal: controller.signal })
            .then((data) => {
                if (!active) return
                setState({
                    ...initialState,
                    key,
                    items: data.items,
                    page: data.pagination.page,
                    totalPages: data.pagination.totalPages,
                    total: data.pagination.total
                })
            })
            .catch((error) => {
                if (active && error.name !== "AbortError") setState({ ...initialState, key, error: error.message })
            })

        return () => {
            active = false
            controller.abort()
        }
    }, [key])

    const loading = state.key !== key
    const hasMore = !loading && state.page < state.totalPages

    const loadMore = useCallback(async () => {
        if (!hasMore || state.loadingMore) return

        setState((current) => ({ ...current, loadingMore: true, moreError: null }))

        try {
            const data = await fetchRef.current({ page: state.page + 1 })

            setState((current) => {
                if (current.key !== key) return current
                const known = new Set(current.items.map((item) => item.id))

                return {
                    ...current,
                    items: [...current.items, ...data.items.filter((item) => !known.has(item.id))],
                    page: data.pagination.page,
                    totalPages: data.pagination.totalPages,
                    total: data.pagination.total,
                    loadingMore: false
                }
            })
        } catch (error) {
            setState((current) => ({ ...current, loadingMore: false, moreError: error.message }))
        }
    }, [hasMore, key, state.loadingMore, state.page])

    const refresh = useCallback(() => setVersion((current) => current + 1), [])

    // Al actualizar (deslizar hacia abajo) se mantiene la lista anterior; al buscar otra cosa, no.
    const sameQuery = state.key?.startsWith(`${baseKey}#`)
    const refreshing = loading && sameQuery

    return {
        items: loading && !sameQuery ? [] : state.items,
        total: state.total,
        loading: loading && !sameQuery,
        refreshing,
        error: loading ? null : state.error,
        loadingMore: state.loadingMore,
        moreError: state.moreError,
        hasMore,
        loadMore,
        refresh
    }
}
