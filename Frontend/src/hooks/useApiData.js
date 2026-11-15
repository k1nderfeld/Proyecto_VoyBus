import { useCallback, useEffect, useRef, useState } from "react"

export function useApiData(loader, deps = []) {
    const loaderRef = useRef(loader)
    loaderRef.current = loader
    const [state, setState] = useState({ data: null, loading: true, error: null })
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let active = true
        const controller = new AbortController()

        setState((current) => ({ ...current, loading: true, error: null }))

        Promise.resolve(loaderRef.current({ signal: controller.signal }))
            .then((data) => {
                if (active) setState({ data, loading: false, error: null })
            })
            .catch((error) => {
                if (active && error.name !== "AbortError") {
                    setState({ data: null, loading: false, error: error.message })
                }
            })

        return () => {
            active = false
            controller.abort()
        }
    }, [...deps, version])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    return { ...state, reload }
}

export function useDebounced(value, delay = 350) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay)
        return () => window.clearTimeout(timer)
    }, [value, delay])

    return debounced
}
