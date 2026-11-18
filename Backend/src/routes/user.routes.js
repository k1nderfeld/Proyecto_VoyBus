const { Router } = require("express")
const { body, param } = require("express-validator")
const { getPreferenceOptions, getPreferences, updatePreferences } = require("../controllers/preferences.controller")
const {
    getProfile,
    updateProfile,
    updatePhoto,
    removePhoto,
    requestEmailChange,
    confirmEmailChange,
    cancelEmailChange
} = require("../controllers/profile.controller")
const { listFavorites, addFavorite, removeFavorite } = require("../controllers/favorites.controller")
const { listHistory, getHistoryEntry } = require("../controllers/history.controller")
const validateFields = require("../middlewares/validateFields")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")
const uploadAvatar = require("../middlewares/uploadAvatar")
const { singleQueryParam, paginationRules } = require("../utils/queryRules")
const { preferenceGroups, preferenceDefinitions, preferencePath } = require("../config/preferences")

const router = Router()

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value)

const passengerOnly = [authenticate, authorize("passenger")]

/* ----------------------------- Preferencias (ACC-06) ----------------------------- */

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

/* -------------------------------- Perfil (ACC-05) -------------------------------- */

const editableProfileFields = ["name", "alias"]

const profileBodyRule = body().custom((value) => {
    if (!isPlainObject(value) || !Object.keys(value).length) {
        throw new Error("Debes indicar al menos un campo para actualizar.")
    }

    const unknownFields = Object.keys(value).filter((field) => !editableProfileFields.includes(field))

    if (unknownFields.length) {
        throw new Error(
            `Campos no permitidos: ${unknownFields.join(", ")}. ` +
            "El correo y la foto se cambian en sus propias secciones."
        )
    }

    return true
})

const profileRules = [
    profileBodyRule,

    body("name")
        .optional()
        .isString().withMessage("El nombre debe ser texto.")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio.")
        .isLength({ min: 2, max: 80 }).withMessage("El nombre debe tener entre 2 y 80 caracteres."),

    // null o "" quitan el alias.
    body("alias")
        .optional()
        .custom((value) => {
            if (value === null || value === "") return true

            if (typeof value !== "string" || !/^[A-Za-z0-9]{1,15}$/.test(value.trim())) {
                throw new Error("El alias debe tener hasta 15 caracteres alfanuméricos, sin espacios ni símbolos.")
            }

            return true
        })
]

const emailChangeRules = [
    body("newEmail")
        .isString().withMessage("El correo electrónico debe ser texto.")
        .trim()
        .notEmpty().withMessage("El nuevo correo electrónico es obligatorio.")
        .isEmail().withMessage("El correo electrónico no es válido.")
        .normalizeEmail()
        .isLength({ max: 120 }).withMessage("El correo electrónico supera los 120 caracteres."),

    body("currentPassword")
        .isString().withMessage("La contraseña actual debe ser texto.")
        .notEmpty().withMessage("La contraseña actual es obligatoria.")
]

const confirmEmailChangeRules = [
    body("token")
        .isString().withMessage("El enlace no es válido o ha expirado.")
        .trim()
        .matches(/^[a-f0-9]{64}$/i).withMessage("El enlace no es válido o ha expirado.")
]

router.get("/me", authenticate, getProfile)

router.patch("/me", passengerOnly, profileRules, validateFields, updateProfile)

router.put("/me/photo", passengerOnly, uploadAvatar, updatePhoto)

router.delete("/me/photo", passengerOnly, removePhoto)

router.post("/me/email-change", passengerOnly, emailChangeRules, validateFields, requestEmailChange)

router.delete("/me/email-change", passengerOnly, cancelEmailChange)

// Pública: se abre desde el enlace enviado al nuevo correo, posiblemente en otro dispositivo.
router.post("/email-change/confirm", confirmEmailChangeRules, validateFields, confirmEmailChange)

/* ------------------------------- Favoritos (ACC-05) ------------------------------ */

const favoriteIdRule = [
    param("id").isInt({ min: 1 }).withMessage("El identificador no es válido.")
]

router.get("/me/favorites", passengerOnly, listFavorites)

for (const type of ["lines", "stops"]) {
    router.post(`/me/favorites/${type}/:id`, passengerOnly, favoriteIdRule, validateFields, addFavorite(type))
    router.delete(`/me/favorites/${type}/:id`, passengerOnly, favoriteIdRule, validateFields, removeFavorite(type))
}

/* ------------------------------- Historial (ACC-07) ------------------------------ */

const MAX_HISTORY_LIMIT = 50

const isCalendarDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

const historyQueryRules = [
    singleQueryParam("from")
        .custom(isCalendarDate).withMessage("La fecha inicial debe tener el formato AAAA-MM-DD."),

    singleQueryParam("to")
        .custom(isCalendarDate).withMessage("La fecha final debe tener el formato AAAA-MM-DD.")
        .bail()
        .custom((to, { req }) => {
            const { from } = req.query
            return typeof from !== "string" || !isCalendarDate(from) || from <= to
        })
        .withMessage("La fecha final no puede ser anterior a la fecha inicial."),

    singleQueryParam("lineId")
        .isInt({ min: 1 }).withMessage("La línea indicada no es válida."),

    ...paginationRules(MAX_HISTORY_LIMIT)
]

const historyIdRule = [
    param("id").isInt({ min: 1 }).withMessage("El identificador no es válido.")
]

router.get("/me/history", passengerOnly, historyQueryRules, validateFields, listHistory)

router.get("/me/history/:id", passengerOnly, historyIdRule, validateFields, getHistoryEntry)

module.exports = router
