const authService = require("./auth.service");

async function register(req, res) {
    try {
        // Solo se extraen los campos permitidos — nunca se pasa req.body completo
        const { name, email, password } = req.body;

        const user = await authService.registerUser({ name, email, password });

        // Solo se devuelven los campos necesarios al cliente
        return res.status(201).json({
            message: "Usuario creado exitosamente",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        // Solo loguear internamente — no exponer el error al cliente
        console.error("[register]", error);

        // Diferenciar errores de negocio de errores internos
        if (error.message === "El correo ya está registrado") {
            return res.status(409).json({
                error: "El correo ya está registrado",
            });
        }

        return res.status(500).json({
            error: "Error interno del servidor",
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const data = await authService.loginUser(email, password);

        return res.json(data);

    } catch (error) {
        console.error("[login]", error);

        // Siempre 401 con mensaje genérico — nunca exponer detalles internos
        return res.status(401).json({
            error: "Credenciales incorrectas",
        });
    }
}

module.exports = {
    register,
    login,
};