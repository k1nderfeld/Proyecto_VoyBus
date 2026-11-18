const dateFormatter = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric"
})

const longDateFormatter = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long"
})

const timeFormatter = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
})

// Hermes (el motor de React Native) no siempre incluye Intl.RelativeTimeFormat: si falta, se arma el texto a mano.
const relativeUnits = {
    minute: ["minuto", "minutos"],
    hour: ["hora", "horas"],
    day: ["día", "días"]
}

const manualRelative = (value, unit) => {
    if (unit === "day" && value === 0) return "hoy"
    if (unit === "day" && value === -1) return "ayer"
    if (unit === "day" && value === 1) return "mañana"
    if (value === 0) return "ahora"

    const amount = Math.abs(value)
    const word = relativeUnits[unit][amount === 1 ? 0 : 1]
    return value < 0 ? `hace ${amount} ${word}` : `en ${amount} ${word}`
}

const relativeFormatter = typeof Intl.RelativeTimeFormat === "function"
    ? new Intl.RelativeTimeFormat("es-CL", { numeric: "auto" })
    : { format: manualRelative }

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")

export const formatDate = (value) => {
    if (!value) return "—"
    return capitalize(dateFormatter.format(new Date(value)).replace(".", ""))
}

export const formatLongDate = (value) => {
    if (!value) return "—"
    return capitalize(longDateFormatter.format(new Date(value)))
}

export const formatTime = (value) => {
    if (!value) return "—"
    return timeFormatter.format(new Date(value))
}

export const formatDateTime = (value) => {
    if (!value) return "—"
    return `${formatDate(value)} · ${formatTime(value)}`
}

export const formatRelative = (value) => {
    if (!value) return "—"

    const date = new Date(value)
    const diff = date.getTime() - Date.now()
    const minutes = Math.round(diff / 60000)
    const hours = Math.round(diff / 3600000)
    const days = Math.round(diff / 86400000)

    if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute")
    if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour")
    if (Math.abs(days) < 7) return relativeFormatter.format(days, "day")

    return formatDate(value)
}

export const formatDuration = (from, to) => {
    if (!from || !to) return "—"

    const minutes = Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000))

    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export const initials = (name) => {
    if (!name) return "VB"

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
}

export const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 20) return "Buenas tardes"
    return "Buenas noches"
}

export const methodLabel = (method) =>
    ({ qr: "Código QR", manual: "Vinculación manual" }[method] || capitalize(method || ""))

export const todayISO = () => {
    const date = new Date()
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export const daysFromNowISO = (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}
