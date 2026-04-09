const express = require("express");
const router = express.Router();

const caja = require("../controllers/caja.controller");

router.get("/resumen/:sesion_id", caja.resumenCaja);

module.exports = router;