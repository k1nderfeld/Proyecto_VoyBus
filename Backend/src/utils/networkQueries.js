const { Op } = require("sequelize")
const { Line, Route, RouteStop } = require("../models")

// Criterios compartidos por las consultas públicas de líneas (RED-01) y paraderos (RED-02).

// Las líneas desactivadas no se muestran; las suspendidas sí, con su aviso.
const visibleLineWhere = { status: { [Op.ne]: "inactive" } }

// La ida se muestra antes que el regreso.
const byDirection = (a, b) =>
    Route.DIRECTIONS.indexOf(a.direction) - Route.DIRECTIONS.indexOf(b.direction) || a.id - b.id

// Recorridos activos de líneas visibles que pasan por los paraderos indicados.
const findServingRouteStops = async (stopIds) => {
    if (!stopIds.length) return []

    return RouteStop.findAll({
        where: { stopId: stopIds },
        include: [{
            model: Route,
            as: "route",
            required: true,
            where: { status: "active" },
            include: [{ model: Line, as: "line", required: true, where: visibleLineWhere }]
        }]
    })
}

module.exports = {
    visibleLineWhere,
    byDirection,
    findServingRouteStops
}
