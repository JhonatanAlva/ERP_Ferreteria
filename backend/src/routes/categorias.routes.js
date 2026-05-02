const express = require("express");
const router = express.Router();

const categoriasController = require("../controllers/categorias.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/", authMiddleware, categoriasController.obtenerCategorias);
router.post("/", authMiddleware, categoriasController.crearCategoria);

module.exports = router;