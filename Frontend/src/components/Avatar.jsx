import { assetUrl } from "../api/client"
import { initials } from "../lib/format"

export function Avatar({ user, size = 44, className = "" }) {
    const photo = assetUrl(user?.photoUrl)

    return (
        <span
            className={`avatar ${className}`.trim()}
            style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
        >
            {photo ? <img src={photo} alt={user?.name || "Foto de perfil"} /> : <span>{initials(user?.name)}</span>}
        </span>
    )
}
