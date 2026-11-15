// Lee "page" y "limit" ya validados (RNF-05: listas paginadas).
const parsePagination = (queryParams, defaultLimit) => ({
    page: queryParams.page ? Number(queryParams.page) : 1,
    limit: queryParams.limit ? Number(queryParams.limit) : defaultLimit
})

const paginationOffset = ({ page, limit }) => (page - 1) * limit

const buildPagination = ({ page, limit }, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
})

module.exports = {
    parsePagination,
    paginationOffset,
    buildPagination
}
