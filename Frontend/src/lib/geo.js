export const projectStops = (items, { width = 800, height = 460, padding = 56 } = {}) => {
    if (!items.length) return []

    const latitudes = items.map((item) => item.latitude)
    const longitudes = items.map((item) => item.longitude)
    const meanLatitude = latitudes.reduce((total, value) => total + value, 0) / latitudes.length
    const longitudeFactor = Math.cos((meanLatitude * Math.PI) / 180)

    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLng = Math.min(...longitudes)
    const maxLng = Math.max(...longitudes)

    const spanLat = Math.max(maxLat - minLat, 0.0015)
    const spanLng = Math.max((maxLng - minLng) * longitudeFactor, 0.0015)

    const scale = Math.min((width - padding * 2) / spanLng, (height - padding * 2) / spanLat)
    const offsetX = (width - spanLng * scale) / 2
    const offsetY = (height - spanLat * scale) / 2

    return items.map((item, index) => ({
        ...item,
        index,
        x: offsetX + (item.longitude - minLng) * longitudeFactor * scale,
        y: offsetY + (maxLat - item.latitude) * scale
    }))
}

export const polylinePath = (points) =>
    points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")

export const distanceInMeters = (from, to) => {
    const radius = 6371000
    const toRadians = (value) => (value * Math.PI) / 180
    const deltaLat = toRadians(to.latitude - from.latitude)
    const deltaLng = toRadians(to.longitude - from.longitude)
    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLng / 2) ** 2

    return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export const formatDistance = (meters) =>
    meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1).replace(".", ",")} km`

export const mapsLink = (stop) =>
    `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`
