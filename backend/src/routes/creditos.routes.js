const express = require("express");
const router = express.Router();

const creditos = require("../controllers/creditos.controller");

router.get("/", creditos.obtenerCreditos);
router.post("/pagar", creditos.pagarCredito);
router.get("/cliente/:id", creditos.creditosCliente);
router.get("/", creditos.obtenerCreditos);
router.get("/historial/:venta_id", creditos.historialPagos);

module.exports = router;
