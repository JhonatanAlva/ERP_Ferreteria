const express = require("express");
const router = express.Router();

const creditos = require("../controllers/creditos.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// NOTA: se eliminó la ruta GET "/" duplicada que existía al final
router.get("/", authMiddleware, creditos.obtenerCreditos);
router.post("/pagar", authMiddleware, creditos.pagarCredito);
router.get("/cliente/:id", authMiddleware, creditos.creditosCliente);
router.get("/historial/:venta_id", authMiddleware, creditos.historialPagos);

module.exports = router;