const express = require("express");
const router = express.Router();

const sesionesController = require("../controllers/sesiones.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/", authMiddleware, sesionesController.obtenerSesiones);
router.get("/:id", authMiddleware, sesionesController.obtenerSesion);
router.get("/:id/resumen", authMiddleware, sesionesController.resumenSesion);
router.post("/", authMiddleware, sesionesController.abrirSesion);
router.put("/:id/cerrar", authMiddleware, sesionesController.cerrarSesion);
router.get("/:id/ventas", authMiddleware, sesionesController.ventasSesion);
router.get("/:id/estadisticas", authMiddleware, sesionesController.estadisticasSesion);
router.get("/:id/movimientos", authMiddleware, sesionesController.movimientosCaja);

module.exports = router;