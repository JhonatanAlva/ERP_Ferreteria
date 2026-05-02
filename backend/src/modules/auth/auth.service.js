const pool = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Rol por defecto para nuevos usuarios — nunca viene del cliente
const DEFAULT_ROLE_ID = process.env.DEFAULT_ROLE_ID || 3; // ej. 3 = "usuario básico"

// Duración de tokens
const ACCESS_TOKEN_EXPIRES = "15m";   // Token de acceso de corta duración
const REFRESH_TOKEN_EXPIRES = "7d";    // Refresh token de larga duración

async function registerUser({ name, email, password }) {
    // role_id y company_id nunca vienen del cliente
    // Se asignan en el servidor según la lógica de negocio

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existing.rows.length > 0) {
        throw new Error("El correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 12); // salt 12 para mayor seguridad

    const result = await pool.query(
        `INSERT INTO users (name, email, password, role_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role_id`,
        [name, email, hashedPassword, DEFAULT_ROLE_ID]
    );

    return result.rows[0];
}

async function loginUser(email, password) {
    const result = await pool.query(
        "SELECT id, name, email, password, company_id, role_id, active FROM users WHERE email = $1",
        [email]
    );

    const user = result.rows[0];

    // Mensaje uniforme para usuario inexistente O inactivo — evita enumeración
    if (!user || !user.active) {
        // Simular el tiempo de bcrypt para evitar timing attacks
        await bcrypt.compare(password, "$2a$12$invalidhashpadding000000000000000000000000000000000000");
        throw new Error("Credenciales incorrectas");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new Error("Credenciales incorrectas");
    }

    // Actualizar último login
    await pool.query(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        [user.id]
    );

    // Access token de corta duración (15 minutos)
    const accessToken = jwt.sign(
        {
            id: user.id,
            company_id: user.company_id,
            role_id: user.role_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES,
            algorithm: "HS256",         // Algoritmo explícito — previene ataque "none"
            issuer: process.env.JWT_ISSUER || "mi-app",
        }
    );

    // Refresh token opaco (aleatorio) para renovar el access token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Guardar el refresh token hasheado en base de datos
    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, hashedRefresh, refreshExpiry]
    );

    return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
        },
    };
}

async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("Refresh token requerido");
    }

    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const result = await pool.query(
        `SELECT rt.user_id, rt.expires_at, u.company_id, u.role_id, u.active
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = $1`,
        [hashedRefresh]
    );

    const record = result.rows[0];

    if (!record || new Date() > new Date(record.expires_at) || !record.active) {
        throw new Error("Refresh token inválido o expirado");
    }

    // Rotar el refresh token (invalidar el actual, emitir uno nuevo)
    await pool.query(
        "DELETE FROM refresh_tokens WHERE token_hash = $1",
        [hashedRefresh]
    );

    const newAccessToken = jwt.sign(
        {
            id: record.user_id,
            company_id: record.company_id,
            role_id: record.role_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES,
            algorithm: "HS256",
            issuer: process.env.JWT_ISSUER || "mi-app",
        }
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newHashedRefresh = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [record.user_id, newHashedRefresh, newExpiry]
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES,
    };
}

async function logout(refreshToken) {
    if (!refreshToken) return;

    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await pool.query(
        "DELETE FROM refresh_tokens WHERE token_hash = $1",
        [hashedRefresh]
    );
}

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
};