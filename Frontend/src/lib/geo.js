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

// Centro de Antofagasta: vista inicial del mapa de paraderos.
export const ANTOFAGASTA_REGION = {
    latitude: -23.6509,
    longitude: -70.3975,
    latitudeDelta: 0.09,
    longitudeDelta: 0.09
}

// Convierte la zona visible del mapa en los parámetros minLat/maxLat/minLng/maxLng del backend (RED-02).
export const regionToBounds = (region) => {
    const round = (value) => Math.round(value * 100000) / 100000

    return {
        minLat: round(Math.max(region.latitude - region.latitudeDelta / 2, -90)),
        maxLat: round(Math.min(region.latitude + region.latitudeDelta / 2, 90)),
        minLng: round(Math.max(region.longitude - region.longitudeDelta / 2, -180)),
        maxLng: round(Math.min(region.longitude + region.longitudeDelta / 2, 180))
    }
}

// Zona que muestra todos los puntos con un margen (para encuadrar un recorrido o un paradero).
export const regionForPoints = (points, padding = 1.4) => {
    if (!points.length) return ANTOFAGASTA_REGION

    const latitudes = points.map((point) => point.latitude)
    const longitudes = points.map((point) => point.longitude)
    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLng = Math.min(...longitudes)
    const maxLng = Math.max(...longitudes)

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * padding, 0.01),
        longitudeDelta: Math.max((maxLng - minLng) * padding, 0.01)
    }
}

export const routeLength = (points) =>
    points.reduce((total, point, index) => (index === 0 ? 0 : total + distanceInMeters(points[index - 1], point)), 0)

export const mapsLink = (stop) =>
    `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`
