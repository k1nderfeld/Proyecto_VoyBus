const { Op, fn, col, where } = require("sequelize")

// Minúsculas, sin tildes y con espacios simples: "Católica" y "catolica" quedan iguales.
// SQLite no ignora tildes al comparar, por eso se guarda una columna "searchText" ya normalizada.
const normalizeSearchText = (value) =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()

// instr() busca el texto tal cual, sin que "%" o "_" funcionen como comodines (a diferencia de LIKE).
const searchTextContains = (column, term) => where(fn("instr", col(column), term), Op.gt, 0)

module.exports = {
    normalizeSearchText,
    searchTextContains
}
