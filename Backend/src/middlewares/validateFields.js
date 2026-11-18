const { validationResult } = require("express-validator")

const validateFields = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Error en el formato de los datos",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        })
    }

    next()
}

module.exports = validateFields
