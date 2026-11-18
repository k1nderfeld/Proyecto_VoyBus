export const lineStatusLabels = {
    active: "En servicio",
    suspended: "Suspendida",
    inactive: "Fuera de servicio"
}

export const lineStatusNotices = {
    suspended: "Esta línea tiene su servicio suspendido temporalmente."
}

export const directionLabels = {
    outbound: "Ida",
    inbound: "Regreso"
}

export const requestStatusLabels = {
    sent: "Enviada",
    next: "Próxima",
    closed: "Cerrada"
}

export const requestCloseLabels = {
    stop_passed: "El vehículo superó el paradero solicitado",
    trip_ended: "El viaje del vehículo finalizó",
    cancelled: "Cancelaste la solicitud",
    unlinked: "Te desvinculaste antes de llegar al paradero"
}

export const methodLabels = {
    qr: "Código QR",
    manual: "Vinculación manual"
}

export const statusLabel = (line) => line.statusLabel || lineStatusLabels[line.status] || line.status

export const statusTone = (status) => {
    if (status === "active") return "success"
    if (status === "suspended") return "warning"
    return "neutral"
}
