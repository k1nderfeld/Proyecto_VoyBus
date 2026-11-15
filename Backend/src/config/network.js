// Textos de la red de transporte que ve el usuario. Los comparten las consultas de la red y el historial.

const directionLabels = {
    outbound: "Ida",
    inbound: "Regreso"
}

const lineStatusLabels = {
    active: "En servicio",
    suspended: "Suspendida temporalmente",
    inactive: "Fuera de servicio"
}

// Las líneas desactivadas no se muestran en las consultas, por eso solo la suspendida tiene aviso (RED-01).
const lineStatusNotices = {
    suspended: "Esta línea tiene su servicio suspendido temporalmente."
}

// Índice = número ISO del día (1 = lunes, 7 = domingo).
const dayNames = [null, "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

// [1,2,3,4,5] -> "Lunes a viernes", [6,7] -> "Sábado y domingo", [1,3,5] -> "Lunes, miércoles y viernes".
const formatDays = (days) => {
    const sorted = [...new Set(days)].sort((a, b) => a - b)

    if (sorted.length === 7) return "Todos los días"

    const consecutive = sorted.every((day, index) => index === 0 || day === sorted[index - 1] + 1)

    if (consecutive && sorted.length >= 3) {
        return capitalize(`${dayNames[sorted[0]]} a ${dayNames[sorted[sorted.length - 1]]}`)
    }

    const names = sorted.map((day) => dayNames[day])
    const text = names.length > 1
        ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`
        : names[0]

    return capitalize(text)
}

module.exports = {
    directionLabels,
    lineStatusLabels,
    lineStatusNotices,
    formatDays
}
