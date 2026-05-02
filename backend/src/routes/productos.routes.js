const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productos.controller");
const upload = require("../middleware/uploadProducto");
const { authMiddleware } = require("../middleware/auth.middleware");

// =============================
// OBTENER PRODUCTOS
// =============================
router.get("/", authMiddleware, productosController.obtenerProductos);

// =============================
// CREAR PRODUCTO
// =============================
router.post("/", authMiddleware, upload.single("imagen"), productosController.crearProducto);

// =============================
// EDITAR PRODUCTO
// =============================
router.put("/:id", authMiddleware, upload.single("imagen"), productosController.editarProducto);

// =============================
// DESACTIVAR PRODUCTO
// =============================
router.patch("/desactivar/:id", authMiddleware, productosController.desactivarProducto);

// =============================
// ACTIVAR PRODUCTO
// =============================
router.patch("/activar/:id", authMiddleware, productosController.activarProducto);

module.exports = router;