const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productos.controller");
const upload = require("../middleware/uploadProducto");


// =============================
// OBTENER PRODUCTOS
// =============================
router.get(
  "/",
  productosController.obtenerProductos
);


// =============================
// CREAR PRODUCTO
// =============================
router.post(
  "/",
  upload.single("imagen"),
  productosController.crearProducto
);


// =============================
// EDITAR PRODUCTO
// =============================
router.put(
  "/:id",
  upload.single("imagen"),
  productosController.editarProducto
);


// =============================
// DESACTIVAR PRODUCTO
// =============================
router.patch(
  "/desactivar/:id",
  productosController.desactivarProducto
);


// =============================
// ACTIVAR PRODUCTO
// =============================
router.patch(
  "/activar/:id",
  productosController.activarProducto
);


module.exports = router;