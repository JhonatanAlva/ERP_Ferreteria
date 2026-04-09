const pool = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(userData) {

    const { name, email, password, company_id, role_id } = userData;

    // verificar si el email ya existe
    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existing.rows.length > 0) {
        throw new Error("El correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name,email,password,company_id,role_id)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id,name,email,company_id,role_id`,
        [name, email, hashedPassword, company_id, role_id]
    );

    return result.rows[0];
}

async function loginUser(email, password) {

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    const user = result.rows[0];

    // mismo mensaje para todo
    if (!user || !user.active) {
        throw new Error("Credenciales incorrectas");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new Error("Credenciales incorrectas");
    }

    // actualizar último login
    await pool.query(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        [user.id]
    );

    const token = jwt.sign(
        {
            id: user.id,
            company_id: user.company_id,
            role_id: user.role_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id
        }
    };
}

module.exports = {
    registerUser,
    loginUser
};