const { query } = require("express-validator")

// Parámetro de consulta opcional: los vacíos se ignoran y los repetidos (?page=1&page=2) se rechazan.
const singleQueryParam = (field) =>
    query(field)
        .optional({ values: "falsy" })
        .custom((value) => typeof value === "string")
        .withMessage(`El parámetro "${field}" solo puede indicarse una vez.`)
        .bail()

const paginationRules = (maxLimit) => [
    singleQueryParam("page")
        .isInt({ min: 1 }).withMessage("La página debe ser un número mayor o igual a 1."),

    singleQueryParam("limit")
        .isInt({ min: 1, max: maxLimit })
        .withMessage(`La cantidad por página debe estar entre 1 y ${maxLimit}.`)
]

const searchRule = (maxLength) =>
    singleQueryParam("search")
        .isLength({ max: maxLength })
        .withMessage(`La búsqueda puede tener hasta ${maxLength} caracteres.`)

module.exports = {
    singleQueryParam,
    paginationRules,
    searchRule
}
