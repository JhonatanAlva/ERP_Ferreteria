const authService = require("./auth.service");

async function register(req, res) {

    try {

        const user = await authService.registerUser(req.body);

        res.status(201).json({
            message: "Usuario creado",
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error creando usuario"
        });
    }
}

async function login(req, res) {

    try {

        const { email, password } = req.body;

        const data = await authService.loginUser(email, password);

        res.json(data);

    } catch (error) {

        res.status(401).json({
            error: error.message
        });
    }
}

module.exports = {
    register,
    login
};