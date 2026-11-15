import { useCallback, useEffect, useRef, useState } from "react"

// Carga datos de la API y vuelve a cargarlos cuando cambian las dependencias (deps) o al llamar a reload().
// loader recibe { signal } para cancelar la petición si la pantalla se cierra antes de que responda.
export function useApiData(loader, deps = []) {
    const loaderRef = useRef(loader)
    const [version, setVersion] = useState(0)
    const [result, setResult] = useState({ key: null, data: null, error: null })

    // Siempre se usa la versión más reciente de loader, sin tener que incluirla en deps.
    useEffect(() => {
        loaderRef.current = loader
    })

    // Las deps son valores simples (texto, números), así que se pueden comparar como texto.
    const key = `${JSON.stringify(deps)}#${version}`

    useEffect(() => {
        let active = true
        const controller = new AbortController()

        Promise.resolve(loaderRef.current({ signal: controller.signal }))
            .then((data) => {
                if (active) setResult({ key, data, error: null })
            })
            .catch((error) => {
                if (active && error.name !== "AbortError") setResult({ key, data: null, error: error.message })
            })

        return () => {
            active = false
            controller.abort()
        }
    }, [key])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    // Mientras carga se mantienen los datos anteriores, para no vaciar la pantalla al actualizar.
    const loading = result.key !== key

    return { data: result.data, error: loading ? null : result.error, loading, reload }
}

export function useDebounced(value, delay = 350) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
