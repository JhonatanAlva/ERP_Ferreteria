const express = require("express");
const router = express.Router();

const ventasController = require("../controllers/ventas.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/", authMiddleware, ventasController.crearVenta);
router.get("/:id/recibo", authMiddleware, ventasController.obtenerRecibo);
router.get("/:id/detalle", authMiddleware, ventasController.detalleVenta);
router.get("/:id/productos", authMiddleware, ventasController.productosVenta);
router.put("/:id/devolver", authMiddleware, ventasController.devolverVenta);

module.exports = router;