const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const authController = require("./auth.controller");
const { registerRules, loginRules, validate } = require("./auth.validator");

// Rate limiter para login: máximo 10 intentos cada 15 minutos por IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Demasiados intentos. Intenta de nuevo en 15 minutos.",
    },
    // Evitar que usuarios con muchos intentos bloqueen a otros
    skipSuccessfulRequests: true,
});

// Rate limiter para registro: máximo 5 registros por hora por IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Demasiados registros desde esta IP. Intenta más tarde.",
    },
});

// POST /auth/register
router.post(
    "/register",
    registerLimiter,
    registerRules,
    validate,
    authController.register
);

// POST /auth/login
router.post(
    "/login",
    loginLimiter,
    loginRules,
    validate,
    authController.login
);

module.exports = router;