import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../context/FavoritesContext"
import { useToast } from "../context/ToastContext"
import { Icon } from "./Icon"

export function FavoriteButton({ type, item, className = "", label = false, size = 18 }) {
    const { user } = useAuth()
    const { isFavorite, toggle } = useFavorites()
    const { error, success } = useToast()
    const navigate = useNavigate()
    const location = useLocation()
    const active = isFavorite(type, item.id)
    const noun = type === "lines" ? "línea" : "paradero"
    const article = type === "lines" ? "la" : "el"
    const state = type === "lines" ? "guardada" : "guardado"

    const onClick = async (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!user) {
            navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
            return
        }

        try {
            const saved = await toggle(type, item)
            success(saved ? `${noun.charAt(0).toUpperCase() + noun.slice(1)} ${state} en favoritos.` : `Quitaste ${article} ${noun} de favoritos.`)
        } catch (requestError) {
            error(requestError.message)
        }
    }

    return (
        <button
            type="button"
            className={`favorite-button ${active ? "is-active" : ""} ${label ? "has-label" : ""} ${className}`.trim()}
            onClick={onClick}
            aria-pressed={active}
            aria-label={active ? `Quitar ${noun} de favoritos` : `Guardar ${noun} en favoritos`}
            title={active ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
            <Icon name="heart" size={size} strokeWidth={active ? 2 : 1.9} />
            {label && <span>{active ? "Guardada" : "Guardar"}</span>}
        </button>
    )
}
