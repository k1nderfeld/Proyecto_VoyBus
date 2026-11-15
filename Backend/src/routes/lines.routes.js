const { Router } = require("express")
const { param } = require("express-validator")
const { listLines, getLine, getLineRoute } = require("../controllers/lines.controller")
const validateFields = require("../middlewares/validateFields")
const { paginationRules, searchRule } = require("../utils/queryRules")

// Consulta de líneas y recorridos (RED-01). Es pública: no requiere iniciar sesión.
const router = Router()

const MAX_LINES_LIMIT = 50
const MAX_SEARCH_LENGTH = 50

const lineIdRule = param("id").isInt({ min: 1 }).withMessage("La línea indicada no es válida.")
const routeIdRule = param("routeId").isInt({ min: 1 }).withMessage("El recorrido indicado no es válido.")

router.get("/", [searchRule(MAX_SEARCH_LENGTH), ...paginationRules(MAX_LINES_LIMIT)], validateFields, listLines)

router.get("/:id", [lineIdRule], validateFields, getLine)

router.get("/:id/routes/:routeId", [lineIdRule, routeIdRule], validateFields, getLineRoute)

module.exports = router
