const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Verificar que el header exista y tenga el formato correcto "Bearer <token>"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Token de autorización requerido",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Token no proporcionado",
            });
        }

        // Verificar con algoritmo explícito — previene el ataque del algoritmo "none"
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: process.env.JWT_ISSUER || "mi-app",
        });

        // Adjuntar solo los campos necesarios al request — no el payload completo
        req.user = {
            id: decoded.id,
            company_id: decoded.company_id,
            role_id: decoded.role_id,
        };

        next();

    } catch (error) {
        // Diferenciar token expirado de token inválido (para el cliente)
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "La sesión ha expirado",
                code: "TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({
            error: "Token inválido",
            code: "TOKEN_INVALID",
        });
    }
}

// Middleware de autorización por rol
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if (!roles.includes(req.user.role_id)) {
            return res.status(403).json({ error: "Sin permisos para esta acción" });
        }

        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole,
};