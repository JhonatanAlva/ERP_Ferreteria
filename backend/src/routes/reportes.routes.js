const express = require("express");
const router = express.Router();

const reportesController = require("../controllers/reportes.controller");

// ventas
router.get("/ventas", reportesController.reporteVentas);
router.get("/ventas-por-dia", reportesController.ventasPorDia);

// productos
router.get("/productos-mas-vendidos", reportesController.productosMasVendidos);
router.get("/productos-stock-bajo", reportesController.productosStockBajo);
router.get("/productos-sin-stock", reportesController.productosSinStock);
router.get("/productos-sin-movimiento", reportesController.productosSinMovimiento);

// stock
router.get("/stock", reportesController.reporteStock);

// clientes
router.get("/clientes-top", reportesController.clientesTop);

// pagos
router.get("/metodos-pago", reportesController.metodosPago);

// sesiones
router.get("/sesiones", reportesController.reporteSesiones);

// recomendaciones
router.get("/recomendaciones", reportesController.recomendaciones);

// exportar
router.get("/exportar/excel", reportesController.exportarExcel);
router.get("/exportar/pdf", reportesController.exportarPDF);

module.exports = router;