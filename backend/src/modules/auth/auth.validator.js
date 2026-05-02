const { body, validationResult } = require("express-validator");

// Reglas de validación para registro
const registerRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("El nombre es requerido")
        .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras"),

    body("email")
        .trim()
        .notEmpty().withMessage("El correo es requerido")
        .isEmail().withMessage("Formato de correo inválido")
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage("Correo demasiado largo"),

    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ min: 8, max: 128 }).withMessage("La contraseña debe tener entre 8 y 128 caracteres")
        .matches(/[A-Z]/).withMessage("Debe contener al menos una mayúscula")
        .matches(/[0-9]/).withMessage("Debe contener al menos un número")
        .matches(/[!@#$%^&*(),.?\":{}|<>]/).withMessage("Debe contener al menos un carácter especial"),
];

// Reglas de validación para login
const loginRules = [
    body("email")
        .trim()
        .notEmpty().withMessage("El correo es requerido")
        .isEmail().withMessage("Formato de correo inválido")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ max: 128 }).withMessage("Contraseña inválida"),
];

// Middleware que ejecuta las validaciones y responde si hay errores
function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: "Datos inválidos",
            details: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }

    next();
}

module.exports = {
    registerRules,
    loginRules,
    validate,
};