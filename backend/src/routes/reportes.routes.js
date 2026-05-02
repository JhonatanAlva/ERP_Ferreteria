const express = require("express");
const router = express.Router();

const reportesController = require("../controllers/reportes.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// ventas
router.get("/ventas", authMiddleware, reportesController.reporteVentas);
router.get("/ventas-por-dia", authMiddleware, reportesController.ventasPorDia);

// productos
router.get("/productos-mas-vendidos", authMiddleware, reportesController.productosMasVendidos);
router.get("/productos-stock-bajo", authMiddleware, reportesController.productosStockBajo);
router.get("/productos-sin-stock", authMiddleware, reportesController.productosSinStock);
router.get("/productos-sin-movimiento", authMiddleware, reportesController.productosSinMovimiento);

// stock
router.get("/stock", authMiddleware, reportesController.reporteStock);

// clientes
router.get("/clientes-top", authMiddleware, reportesController.clientesTop);

// pagos
router.get("/metodos-pago", authMiddleware, reportesController.metodosPago);

// sesiones
router.get("/sesiones", authMiddleware, reportesController.reporteSesiones);

// recomendaciones
router.get("/recomendaciones", authMiddleware, reportesController.recomendaciones);

// exportar
router.get("/exportar/excel", authMiddleware, reportesController.exportarExcel);
router.get("/exportar/pdf", authMiddleware, reportesController.exportarPDF);

module.exports = router;