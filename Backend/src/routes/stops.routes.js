const { Router } = require("express")
const { param, query } = require("express-validator")
const { listStops, getStop } = require("../controllers/stops.controller")
const validateFields = require("../middlewares/validateFields")
const { optionalAuthenticate } = require("../middlewares/authenticate")
const { singleQueryParam, paginationRules, searchRule } = require("../utils/queryRules")

// Consulta de paraderos (RED-02). Es pública: no requiere iniciar sesión.
// Guardar y quitar favoritos está en /api/users/me/favorites/stops/:id (solo pasajeros).
const router = Router()

// El mapa puede pedir más puntos por página que una lista.
const MAX_STOPS_LIMIT = 100
const MAX_SEARCH_LENGTH = 50

const coordinateRule = (field, max, label) =>
    singleQueryParam(field)
        .isFloat({ min: -max, max }).withMessage(`${label} debe ser un número entre -${max} y ${max}.`)

const boundFields = ["minLat", "maxLat", "minLng", "maxLng"]

// La zona del mapa se indica completa: las cuatro coordenadas o ninguna.
const boundsRule = query().custom((params) => {
    const received = boundFields.filter((field) => params[field] !== undefined && params[field] !== "")

    if (received.length && received.length < boundFields.length) {
        throw new Error("Para buscar en el mapa debes indicar minLat, maxLat, minLng y maxLng.")
    }

    if (
        received.length &&
        (Number(params.minLat) > Number(params.maxLat) || Number(params.minLng) > Number(params.maxLng))
    ) {
        throw new Error("En la zona del mapa, cada mínimo debe ser menor o igual a su máximo.")
    }

    return true
})

const listRules = [
    searchRule(MAX_SEARCH_LENGTH),
    coordinateRule("minLat", 90, "La latitud mínima"),
    coordinateRule("maxLat", 90, "La latitud máxima"),
    coordinateRule("minLng", 180, "La longitud mínima"),
    coordinateRule("maxLng", 180, "La longitud máxima"),
    boundsRule,
    ...paginationRules(MAX_STOPS_LIMIT)
]

const stopIdRule = param("id").isInt({ min: 1 }).withMessage("El paradero indicado no es válido.")

router.get("/", listRules, validateFields, listStops)

router.get("/:id", optionalAuthenticate, [stopIdRule], validateFields, getStop)

module.exports = router
