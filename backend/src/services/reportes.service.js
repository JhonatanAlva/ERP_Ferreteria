const db = require("../config/database");

exports.obtenerDatosReporte = async (desde, hasta) => {
  const ventas = await db.query(`
    SELECT COUNT(*) AS total_ventas,
           COALESCE(SUM(total),0) AS total
    FROM ventas
    WHERE estado='activa'
    AND fecha >= $1
    AND fecha < ($2::date + interval '1 day')
  `, [desde, hasta]);

  const bajoStock = await db.query(`
    SELECT nombre, stock
    FROM productos
    WHERE stock <= 5
    ORDER BY stock ASC
  `);

  const sinStock = await db.query(`
    SELECT nombre
    FROM productos
    WHERE stock = 0
  `);

  const productos = await db.query(`
    SELECT p.nombre, SUM(dv.cantidad) cantidad
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.estado='activa'
    GROUP BY p.nombre
    ORDER BY cantidad DESC
    LIMIT 10
  `);

  return {
    ventas: ventas.rows[0],
    bajoStock: bajoStock.rows,
    sinStock: sinStock.rows,
    productos: productos.rows
  };
};