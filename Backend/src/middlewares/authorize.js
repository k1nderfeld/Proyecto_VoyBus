// Restringe una ruta a ciertos roles. Debe usarse después de "authenticate".
const authorize = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({
            success: false,
            message: "No tienes permiso para realizar esta acción."
        })
    }

    next()
}

module.exports = authorize
