import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { api } from "../api/client"
import { useAuth } from "./AuthContext"

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
    const { user } = useAuth()
    const [lines, setLines] = useState([])
    const [stops, setStops] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = useCallback(async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            const response = await api.get("/users/me/favorites")
            setLines(response.data.lines || [])
            setStops(response.data.stops || [])
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            refresh()
        } else {
            setLines([])
            setStops([])
        }
    }, [user, refresh])

    const lineIds = useMemo(() => new Set(lines.map((line) => line.id)), [lines])
    const stopIds = useMemo(() => new Set(stops.map((stop) => stop.id)), [stops])

    const isFavorite = useCallback(
        (type, id) => (type === "lines" ? lineIds.has(id) : stopIds.has(id)),
        [lineIds, stopIds]
    )

    const toggle = useCallback(
        async (type, item) => {
            const active = isFavorite(type, item.id)

            if (active) {
                await api.delete(`/users/me/favorites/${type}/${item.id}`)

                if (type === "lines") setLines((current) => current.filter((line) => line.id !== item.id))
                else setStops((current) => current.filter((stop) => stop.id !== item.id))

                return false
            }

            const response = await api.post(`/users/me/favorites/${type}/${item.id}`, undefined)
            const saved = response.data

            if (type === "lines") setLines((current) => [saved, ...current])
            else setStops((current) => [saved, ...current])

            return true
        },
        [isFavorite]
    )

    const value = useMemo(
        () => ({ lines, stops, loading, error, refresh, toggle, isFavorite }),
        [lines, stops, loading, error, refresh, toggle, isFavorite]
    )

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => useContext(FavoritesContext)
