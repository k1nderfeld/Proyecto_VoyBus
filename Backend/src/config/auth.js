const crypto = require("crypto")

module.exports = {
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    maxFailedAttempts: 5,
    lockMinutes: 15
}
