const multer = require("multer")
const { maxAvatarBytes } = require("../config/uploads")

// La imagen queda en memoria para validar su contenido real antes de guardarla en disco.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxAvatarBytes, files: 1 }
}).single("photo")

const uploadAvatar = (req, res, next) => {
    upload(req, res, (error) => {
        if (!error) return next()

        let message = "No se pudo procesar la imagen."

        if (error.code === "LIMIT_FILE_SIZE") {
            message = `La imagen no puede superar los ${maxAvatarBytes / (1024 * 1024)} MB.`
        } else if (error instanceof multer.MulterError) {
            message = "Debes enviar una sola imagen en el campo \"photo\"."
        }

        return res.status(400).json({
            success: false,
            message
        })
    })
}

module.exports = uploadAvatar
