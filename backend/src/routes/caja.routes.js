const express = require("express");
const router = express.Router();

const caja = require("../controllers/caja.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/resumen/:sesion_id", authMiddleware, caja.resumenCaja);

module.exports = router;