const crypto = require("crypto")

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

const decodeBase32 = (value) => {
    const secret = value.replace(/=+$/, "").toUpperCase().replace(/\s/g, "")
    let bits = 0
    let buffer = 0
    const bytes = []

    for (const character of secret) {
        const index = alphabet.indexOf(character)
        if (index === -1) {
            return null
        }

        buffer = (buffer << 5) | index
        bits += 5

        if (bits >= 8) {
            bytes.push((buffer >>> (bits - 8)) & 0xff)
            bits -= 8
        }
    }

    return Buffer.from(bytes)
}

const generateCode = (secret, counter) => {
    const key = decodeBase32(secret)
    if (!key || key.length === 0) {
        return null
    }

    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64BE(BigInt(counter))

    const hmac = crypto.createHmac("sha1", key).update(buffer).digest()
    const offset = hmac[hmac.length - 1] & 0x0f
    const binary = ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)

    return String(binary % 1000000).padStart(6, "0")
}

const verifyTotp = (secret, code, window = 1) => {
    if (typeof secret !== "string" || !/^\d{6}$/.test(String(code))) {
        return false
    }

    const counter = Math.floor(Date.now() / 30000)
    const received = Buffer.from(String(code))

    for (let offset = -window; offset <= window; offset++) {
        const expected = generateCode(secret, counter + offset)
        if (expected && crypto.timingSafeEqual(Buffer.from(expected), received)) {
            return true
        }
    }

    return false
}

module.exports = verifyTotp
