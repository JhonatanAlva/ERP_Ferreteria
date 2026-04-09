const db = require("../config/database");

// NUEVA ARQUITECTURA
const { obtenerDatosReporte } = require("../services/reportes.service");
const { generarExcel } = require("../exports/excelExporter");
const { generarPDF } = require("../exports/pdfExporter");

// ===============================
// REPORTE DE VENTAS POR RANGO
// ===============================
exports.reporteVentas = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await db.query(
      `
      SELECT 
        COUNT(*) AS total_ventas,
        COALESCE(SUM(total), 0) AS total_vendido
      FROM ventas
      WHERE estado = 'activa'
      AND fecha >= $1
      AND fecha < ($2::date + interval '1 day')
      `,
      [desde, hasta]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en reporte de ventas" });
  }
};

// ===============================
// PRODUCTOS MÁS VENDIDOS
// ===============================
exports.productosMasVendidos = async (req, res) => {
  const { categoria } = req.query;

  try {
    const result = await db.query(
      `
      SELECT 
        p.nombre,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.subtotal) AS ingresos
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.estado = 'activa'
      AND ($1::int IS NULL OR p.categoria_id = $1)
      GROUP BY p.nombre
      ORDER BY total_vendido DESC
      LIMIT 10
      `,
      [categoria || null]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en productos más vendidos" });
  }
};

// ===============================
// VENTAS POR DÍA
// ===============================
exports.ventasPorDia = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await db.query(
      `
      SELECT 
        DATE(fecha) as fecha,
        SUM(total) as total
      FROM ventas
      WHERE estado = 'activa'
      AND fecha >= $1
      AND fecha < ($2::date + interval '1 day')
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
      `,
      [desde, hasta]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en ventas por día" });
  }
};

// ===============================
// REPORTE STOCK GENERAL
// ===============================
exports.reporteStock = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) AS total_productos,
        SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS stock_bajo,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS sin_stock
      FROM productos
    `);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en stock" });
  }
};

// ===============================
// PRODUCTOS STOCK BAJO
// ===============================
exports.productosStockBajo = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, stock
      FROM productos
      WHERE stock <= 5
      ORDER BY stock ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error stock bajo" });
  }
};

// ===============================
// PRODUCTOS SIN STOCK
// ===============================
exports.productosSinStock = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre
      FROM productos
      WHERE stock = 0
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error sin stock" });
  }
};

// ===============================
// PRODUCTOS SIN MOVIMIENTO
// ===============================
exports.productosSinMovimiento = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.nombre, p.stock
      FROM productos p
      LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
      WHERE dv.producto_id IS NULL
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error sin movimiento" });
  }
};

// ===============================
// CLIENTES TOP
// ===============================
exports.clientesTop = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.name,
        COUNT(v.id) AS compras,
        SUM(v.total) AS total_gastado
      FROM ventas v
      JOIN clients c ON v.cliente_id = c.id
      WHERE v.estado = 'activa'
      GROUP BY c.name
      ORDER BY total_gastado DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error clientes top" });
  }
};

// ===============================
// MÉTODOS DE PAGO
// ===============================
exports.metodosPago = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        metodo_pago,
        COUNT(*) AS total_ventas,
        SUM(total) AS total
      FROM ventas
      WHERE estado = 'activa'
      GROUP BY metodo_pago
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error métodos de pago" });
  }
};

// ===============================
// SESIONES POS
// ===============================
exports.reporteSesiones = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        fecha_apertura,
        fecha_cierre,
        total_vendido
      FROM sesiones_pos
      ORDER BY id DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error sesiones" });
  }
};

// ===============================
// RECOMENDACIONES INTELIGENTES
// ===============================
exports.recomendaciones = async (req, res) => {
  try {
    const sinStock = await db.query(`
      SELECT nombre, stock
      FROM productos
      WHERE stock = 0
    `);

    const stockBajo = await db.query(`
      SELECT nombre, stock
      FROM productos
      WHERE stock > 0 AND stock <= 5
      ORDER BY stock ASC
    `);

    const masVendidos = await db.query(`
      SELECT p.nombre, SUM(dv.cantidad) AS total
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      GROUP BY p.nombre
      ORDER BY total DESC
      LIMIT 3
    `);

    const sinMovimiento = await db.query(`
      SELECT p.nombre
      FROM productos p
      LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
      WHERE dv.producto_id IS NULL
    `);

    res.json({
      critico: sinStock.rows,
      bajo: stockBajo.rows,
      recomendados: masVendidos.rows,
      sinMovimiento: sinMovimiento.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en recomendaciones" });
  }
};

// ===============================
// EXPORTAR EXCEL (NUEVO)
// ===============================
exports.exportarExcel = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const data = await obtenerDatosReporte(desde, hasta);

    await generarExcel(data, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error exportando Excel" });
  }
};

// ===============================
// EXPORTAR PDF (NUEVO)
// ===============================
exports.exportarPDF = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const data = await obtenerDatosReporte(desde, hasta);

    generarPDF(data, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error exportando PDF" });
  }
};