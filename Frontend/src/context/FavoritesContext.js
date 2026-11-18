import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "./AuthContext"

const FavoritesContext = createContext(null)

const EMPTY = []

// Favoritos de líneas y paraderos. Solo los pasajeros tienen favoritos (ACC-05, RED-02):
// para invitados y conductores las listas quedan vacías y no se llama al backend.
export function FavoritesProvider({ children }) {
    const { user, isPassenger } = useAuth()
    // ownerId evita mostrar los favoritos de una cuenta anterior después de cambiar de usuario.
    const [saved, setSaved] = useState({ ownerId: null, lines: EMPTY, stops: EMPTY })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const ownerId = isPassenger ? user.id : null

    const refresh = useCallback(async () => {
        if (!ownerId) return

        setLoading(true)
        setError(null)

        try {
            const response = await api.get("/users/me/favorites")
            setSaved({ ownerId, lines: response.data.lines || EMPTY, stops: response.data.stops || EMPTY })
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setLoading(false)
        }
    }, [ownerId])

    // Carga inicial al iniciar sesión como pasajero. refresh() queda para actualizar a pedido del usuario.
    useEffect(() => {
        if (!ownerId) return undefined

        let active = true

        api.get("/users/me/favorites")
            .then((response) => {
                if (active) {
                    setSaved({ ownerId, lines: response.data.lines || EMPTY, stops: response.data.stops || EMPTY })
                }
            })
            .catch((requestError) => {
                if (active) setError(requestError.message)
            })

        return () => {
            active = false
        }
    }, [ownerId])

    const current = ownerId && saved.ownerId === ownerId ? saved : null
    const isLoading = loading || (Boolean(ownerId) && !current && !error)
    const lines = current?.lines ?? EMPTY
    const stops = current?.stops ?? EMPTY

    const lineIds = useMemo(() => new Set(lines.map((line) => line.id)), [lines])
    const stopIds = useMemo(() => new Set(stops.map((stop) => stop.id)), [stops])

    const isFavorite = useCallback(
        (type, id) => (type === "lines" ? lineIds.has(id) : stopIds.has(id)),
        [lineIds, stopIds]
    )

    // type es "lines" o "stops". Devuelve true si quedó guardado y false si se quitó.
    const toggle = useCallback(
        async (type, item) => {
            const updateList = (change) =>
                setSaved((state) => (state.ownerId === ownerId ? { ...state, [type]: change(state[type]) } : state))

            if (isFavorite(type, item.id)) {
                await api.delete(`/users/me/favorites/${type}/${item.id}`)
                updateList((list) => list.filter((entry) => entry.id !== item.id))
                return false
            }

            const response = await api.post(`/users/me/favorites/${type}/${item.id}`)
            updateList((list) => [response.data, ...list.filter((entry) => entry.id !== item.id)])
            return true
        },
        [isFavorite, ownerId]
    )

    const value = useMemo(
        () => ({ lines, stops, loading: isLoading, error, refresh, toggle, isFavorite }),
        [lines, stops, isLoading, error, refresh, toggle, isFavorite]
    )

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => useContext(FavoritesContext)
