const { Router } = require("express")
const { body } = require("express-validator")
const { getPreferenceOptions, getPreferences, updatePreferences } = require("../controllers/preferences.controller")
const validateFields = require("../middlewares/validateFields")
const authenticate = require("../middlewares/authenticate")
const { preferenceGroups, preferenceDefinitions, preferencePath } = require("../config/preferences")

const router = Router()

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value)

const nestedGroups = Object.keys(preferenceGroups).filter((group) => group !== "general")
const allowedPaths = new Set(preferenceDefinitions.map(preferencePath))

// Rechaza campos que la app no soporta y exige al menos una preferencia conocida.
const preferencesBodyRule = body().custom((value) => {
    if (!isPlainObject(value)) {
        throw new Error("Debes indicar al menos una preferencia para actualizar.")
    }

    const receivedPaths = []

    for (const [key, fieldValue] of Object.entries(value)) {
        if (nestedGroups.includes(key) && isPlainObject(fieldValue)) {
            Object.keys(fieldValue).forEach((nestedKey) => receivedPaths.push(`${key}.${nestedKey}`))
        } else if (!nestedGroups.includes(key)) {
            receivedPaths.push(key)
        }
    }

    const unknownPaths = receivedPaths.filter((path) => !allowedPaths.has(path))

    if (unknownPaths.length) {
        throw new Error(`Preferencias no soportadas: ${unknownPaths.join(", ")}.`)
    }

    if (!receivedPaths.length) {
        throw new Error("Debes indicar al menos una preferencia para actualizar.")
    }

    return true
})

const preferenceGroupRules = nestedGroups.map((group) =>
    body(group)
        .optional()
        .custom(isPlainObject)
        .withMessage(`${preferenceGroups[group].label}: debe ser un objeto con las opciones a modificar.`)
)

const preferenceValueRules = preferenceDefinitions.map((definition) => {
    const field = body(preferencePath(definition)).optional()

    if (definition.type === "enum") {
        const values = definition.options.map((option) => option.value)
        return field
            .isIn(values)
            .withMessage(`${definition.label}: opción no soportada. Valores permitidos: ${values.join(", ")}.`)
    }

    return field
        .custom((value) => typeof value === "boolean")
        .withMessage(`${definition.label}: debe ser true o false.`)
})

router.get("/preferences/options", getPreferenceOptions)

router.get("/me/preferences", authenticate, getPreferences)

router.patch(
    "/me/preferences",
    authenticate,
    [preferencesBodyRule, ...preferenceGroupRules, ...preferenceValueRules],
    validateFields,
    updatePreferences
)

module.exports = router
