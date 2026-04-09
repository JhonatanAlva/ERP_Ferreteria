const db = require("../config/database");

async function getRoles(req, res) {

    try {

        const result = await db.query(`
            SELECT id, name
            FROM roles
            ORDER BY id
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error obteniendo roles"
        });

    }

}

module.exports = {
    getRoles
};