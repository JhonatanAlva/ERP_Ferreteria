const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");

// Rutas de módulos
const authRoutes = require("./src/modules/auth/auth.routes");
const clientsRoutes = require("./src/routes/clients.routes");
const productosRoutes = require("./src/routes/productos.routes");
const categoriasRoutes = require("./src/routes/categorias.routes");
const ventasRoutes = require("./src/routes/ventas.routes");
const sesionesRoutes = require("./src/routes/sesiones.routes");
const creditosRoutes = require("./src/routes/creditos.routes");
const cajaRoutes = require("./src/routes/caja.routes");
const usersRoutes = require("./src/routes/users.routes");
const rolesRoutes = require("./src/routes/roles.routes");
const reportesRoutes = require("./src/routes/reportes.routes");


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir imágenes
app.use("/uploads", express.static("uploads"));

// Ruta base
app.get("/", (req, res) => {
  res.send("ERP API funcionando 🚀");
});

// Test conexión DB
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Conexión a PostgreSQL exitosa",
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error conectando a la base de datos"
    });
  }
});

// Rutas del sistema
app.use("/auth", authRoutes);
app.use("/clients", clientsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/reportes", reportesRoutes);

app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);

app.use("/api/ventas", ventasRoutes);
app.use("/api/sesiones", sesionesRoutes);

app.use("/api/creditos", creditosRoutes);
app.use("/api/caja", cajaRoutes);

module.exports = app;