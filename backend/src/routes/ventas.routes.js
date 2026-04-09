const express = require("express");
const router = express.Router();

const ventasController = require("../controllers/ventas.controller");

router.post("/", ventasController.crearVenta);
router.get("/:id/recibo", ventasController.obtenerRecibo);
router.get("/:id/detalle", ventasController.detalleVenta);
router.get("/:id/productos", ventasController.productosVenta);
router.put("/:id/devolver", ventasController.devolverVenta);

module.exports = router;