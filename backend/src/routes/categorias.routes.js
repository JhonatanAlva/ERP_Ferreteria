const express = require("express");
const router = express.Router();

const categoriasController = require("../controllers/categorias.controller");

router.get("/", categoriasController.obtenerCategorias);

router.post("/", categoriasController.crearCategoria);

module.exports = router;