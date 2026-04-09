const express = require("express");
const router = express.Router();

const sesionesController = require("../controllers/sesiones.controller");

router.get("/", sesionesController.obtenerSesiones);
router.get("/:id", sesionesController.obtenerSesion);
router.get("/:id/resumen", sesionesController.resumenSesion);
router.post("/", sesionesController.abrirSesion);
router.put("/:id/cerrar", sesionesController.cerrarSesion);
router.get("/:id/ventas", sesionesController.ventasSesion);
router.get("/:id/estadisticas", sesionesController.estadisticasSesion);
router.get("/:id/movimientos", sesionesController.movimientosCaja);

module.exports = router;