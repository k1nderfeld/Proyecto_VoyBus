const fs = require("fs")
const path = require("path")

const uploadsDir = path.join(__dirname, "..", "..", "uploads")
const avatarsDir = path.join(uploadsDir, "avatars")

fs.mkdirSync(avatarsDir, { recursive: true })

module.exports = {
    uploadsDir,
    avatarsDir,
    publicPath: "/uploads",
    avatarPublicPath: "/uploads/avatars",
    maxAvatarBytes: 2 * 1024 * 1024
}
