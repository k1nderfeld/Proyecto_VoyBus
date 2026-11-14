const HttpError = require("./HttpError")

const respondWithError = (res, error, message) => {
    if (error instanceof HttpError) {
        if (error.details.retryAfterSeconds) {
            res.set("Retry-After", String(error.details.retryAfterSeconds))
        }

        return res.status(error.status).json({
            success: false,
            message: error.message,
            ...error.details
        })
    }

    return res.status(500).json({
        success: false,
        message
    })
}

module.exports = respondWithError
