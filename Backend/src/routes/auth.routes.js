const { Router } = require("express")
const { body } = require("express-validator")
const {
    demoAccounts,
    register,
    verify,
    resendVerification,
    googleLogin,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
} = require("../controllers/auth.controller")
const { setupTwoFactor, enableTwoFactor, disableTwoFactor } = require("../controllers/twoFactor.controller")
const validateFields = require("../middlewares/validateFields")
const authenticate = require("../middlewares/authenticate")
const { demoAccountsEnabled } = require("../config/demo")

const router = Router()

const newPasswordRules = (field) =>
    body(field)
        .isString().withMessage("La contraseña debe ser texto.")
        .isLength({ min: 8, max: 72 }).withMessage("La contraseña debe tener entre 8 y 72 caracteres.")
        .matches(/[A-Za-z]/).withMessage("La contraseña debe incluir al menos una letra.")
        .matches(/\d/).withMessage("La contraseña debe incluir al menos un número.")

router.post(
    "/register",
    [
        body("name")
            .isString().withMessage("El nombre debe ser texto.")
            .trim()
            .notEmpty().withMessage("El nombre es obligatorio.")
            .isLength({ min: 2, max: 80 }).withMessage("El nombre debe tener entre 2 y 80 caracteres."),

        body("email")
            .custom((value, { req }) => Boolean(value || req.body.phone))
            .withMessage("Debes indicar un correo electrónico o un teléfono.")
            .optional({ values: "falsy" })
            .isString().withMessage("El correo electrónico debe ser texto.")
            .trim()
            .isEmail().withMessage("El correo electrónico no es válido.")
            .normalizeEmail()
            .isLength({ max: 120 }).withMessage("El correo electrónico supera los 120 caracteres."),

        body("phone")
            .optional({ values: "falsy" })
            .isString().withMessage("El teléfono debe ser texto.")
            .trim()
            .matches(/^\+?[1-9]\d{7,14}$/).withMessage("El teléfono debe incluir entre 8 y 15 dígitos y puede iniciar con +."),

        body("password")
            .isString().withMessage("La contraseña debe ser texto.")
            .isLength({ min: 8, max: 15 }).withMessage("La contraseña debe tener entre 8 y 15 caracteres.")
            .matches(/[A-Z]/).withMessage("La contraseña debe incluir al menos una mayúscula.")
            .matches(/[a-z]/).withMessage("La contraseña debe incluir al menos una minúscula.")
            .matches(/\d/).withMessage("La contraseña debe incluir al menos un número.")
            .matches(/[^A-Za-z0-9]/).withMessage("La contraseña debe incluir al menos un símbolo."),

        body("confirmPassword")
            .custom((value, { req }) => value === req.body.password)
            .withMessage("Las contraseñas no coinciden."),

        body("acceptTerms")
            .custom((value) => value === true || value === "true")
            .withMessage("Debes aceptar los términos y la política de privacidad.")
    ],
    validateFields,
    register
)

router.post(
    "/login",
    [
        body("email")
            .custom((value, { req }) => Boolean(value || req.body.phone))
            .withMessage("Debes indicar un correo electrónico o un teléfono.")
            .optional({ values: "falsy" })
            .isString().withMessage("El correo electrónico debe ser texto.")
            .trim()
            .isEmail().withMessage("El correo electrónico no es válido.")
            .normalizeEmail(),

        body("phone")
            .optional({ values: "falsy" })
            .isString().withMessage("El teléfono debe ser texto.")
            .trim()
            .matches(/^\+?[1-9]\d{7,14}$/).withMessage("El teléfono debe incluir entre 8 y 15 dígitos y puede iniciar con +."),

        body("password")
            .isString().withMessage("La contraseña debe ser texto.")
            .notEmpty().withMessage("La contraseña es obligatoria."),

        body("twoFactorCode")
            .optional({ values: "falsy" })
            .isString().withMessage("El código de verificación debe ser texto.")
            .trim()
            .matches(/^\d{6}$/).withMessage("El código de verificación debe tener 6 dígitos.")
    ],
    validateFields,
    login
)

router.post("/logout", authenticate, logout)

// Cuentas demo para el login de la app. En producción esta ruta no existe (404).
router.get("/demo-accounts", (req, res, next) => {
    if (!demoAccountsEnabled()) {
        return res.status(404).json({ success: false, message: "Recurso no encontrado." })
    }
    next()
}, demoAccounts)

/* --------------------- Verificación del medio de contacto (ACC-01) --------------------- */

// Correo o teléfono de la cuenta, con el mismo formato que en el registro.
const contactRules = [
    body("email")
        .custom((value, { req }) => Boolean(value || req.body.phone))
        .withMessage("Debes indicar un correo electrónico o un teléfono.")
        .optional({ values: "falsy" })
        .isString().withMessage("El correo electrónico debe ser texto.")
        .trim()
        .isEmail().withMessage("El correo electrónico no es válido.")
        .normalizeEmail(),

    body("phone")
        .optional({ values: "falsy" })
        .isString().withMessage("El teléfono debe ser texto.")
        .trim()
        .matches(/^\+?[1-9]\d{7,14}$/).withMessage("El teléfono debe incluir entre 8 y 15 dígitos y puede iniciar con +.")
]

const sixDigitCode = (field, message) =>
    body(field)
        .isString().withMessage(message)
        .trim()
        .matches(/^\d{6}$/).withMessage(message)

router.post(
    "/verify",
    [...contactRules, sixDigitCode("code", "El código debe tener 6 dígitos.")],
    validateFields,
    verify
)

router.post("/verify/resend", contactRules, validateFields, resendVerification)

/* ------------------------------ Google (ACC-01, ACC-02) ------------------------------ */

router.post(
    "/google",
    [
        body("idToken")
            .isString().withMessage("Falta el token de Google.")
            .notEmpty().withMessage("Falta el token de Google."),

        body("acceptTerms")
            .optional()
            .isBoolean({ strict: true }).withMessage("acceptTerms debe ser true o false."),

        body("twoFactorCode")
            .optional({ values: "falsy" })
            .isString().withMessage("El código de verificación debe ser texto.")
            .trim()
            .matches(/^\d{6}$/).withMessage("El código de verificación debe tener 6 dígitos.")
    ],
    validateFields,
    googleLogin
)

/* ------------------------- Verificación en dos pasos (ACC-01) ------------------------- */

router.post("/2fa/setup", authenticate, setupTwoFactor)

router.post(
    "/2fa/enable",
    authenticate,
    [sixDigitCode("code", "El código debe tener 6 dígitos.")],
    validateFields,
    enableTwoFactor
)

router.post(
    "/2fa/disable",
    authenticate,
    [
        body("currentPassword")
            .isString().withMessage("La contraseña actual debe ser texto.")
            .notEmpty().withMessage("La contraseña actual es obligatoria."),
        sixDigitCode("code", "El código debe tener 6 dígitos.")
    ],
    validateFields,
    disableTwoFactor
)

router.post(
    "/forgot-password",
    [
        body("email")
            .isString().withMessage("El correo electrónico debe ser texto.")
            .trim()
            .notEmpty().withMessage("El correo electrónico es obligatorio.")
            .isEmail().withMessage("El correo electrónico no es válido.")
            .normalizeEmail()
            .isLength({ max: 120 }).withMessage("El correo electrónico supera los 120 caracteres.")
    ],
    validateFields,
    forgotPassword
)

router.post(
    "/reset-password",
    [
        body("token")
            .isString().withMessage("El enlace no es válido o ha expirado.")
            .trim()
            .matches(/^[a-f0-9]{64}$/i).withMessage("El enlace no es válido o ha expirado."),

        newPasswordRules("newPassword"),

        body("confirmPassword")
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage("Las contraseñas no coinciden.")
    ],
    validateFields,
    resetPassword
)

router.post(
    "/change-password",
    authenticate,
    [
        body("currentPassword")
            .isString().withMessage("La contraseña actual debe ser texto.")
            .notEmpty().withMessage("La contraseña actual es obligatoria."),

        newPasswordRules("newPassword"),

        body("confirmPassword")
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage("Las contraseñas no coinciden.")
    ],
    validateFields,
    changePassword
)

module.exports = router
