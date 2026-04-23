const db = require("../config/database");

exports.crearVenta = async (req, res) => {
  const { sesion_id, cliente_id, metodo_pago, productos, total, monto_pagado } =
    req.body;

  const client = await db.connect();

  try {
    if (!productos || productos.length === 0) {
      return res.status(400).json({
        error: "No hay productos en la venta",
      });
    }

    // validar cliente si es crédito
    if (metodo_pago === "credito" && !cliente_id) {
      return res.status(400).json({
        error: "Debe seleccionar cliente para venta a crédito",
      });
    }

    await client.query("BEGIN");

    // ==========================
    // FIX #4 — VALIDAR SESIÓN ACTIVA
    // Evita registrar ventas en sesiones cerradas o inexistentes
    // ==========================
    const sesion = await client.query(
      `SELECT id FROM sesiones_pos WHERE id = $1 AND estado = 'abierta'`,
      [sesion_id]
    );

    if (sesion.rows.length === 0) {
      throw new Error("La sesión POS no está activa");
    }

    // determinar estado de pago
    const estado_pago = metodo_pago === "credito" ? "pendiente" : "pagado";

    // determinar monto pagado
    let montoPagado = 0;

    if (metodo_pago === "efectivo") {
      montoPagado = monto_pagado || total;
    }

    if (metodo_pago === "tarjeta") {
      montoPagado = total;
    }

    if (metodo_pago === "credito") {
      montoPagado = 0;
    }

    // ==========================
    // FIX #5 — RECALCULAR TOTAL EN EL SERVIDOR
    // Evita que el frontend envíe un total manipulado
    // ==========================
    let totalCalculado = 0;

    for (const p of productos) {
      totalCalculado += Number(p.cantidad) * Number(p.precio);
    }

    // Tolerancia de 1 centavo por posibles redondeos de decimales
    if (Math.abs(totalCalculado - Number(total)) > 0.01) {
      throw new Error("El total no coincide con los productos enviados");
    }

    // ==========================
    // CREAR VENTA
    // ==========================
    const venta = await client.query(
      `INSERT INTO ventas
  (sesion_id, cliente_id, total, fecha, metodo_pago, estado_pago, monto_pagado, estado)
  VALUES ($1,$2,$3,NOW(),$4,$5,$6,'activa')
  RETURNING id`,
      [
        sesion_id,
        cliente_id || null,
        total,
        metodo_pago,
        estado_pago,
        montoPagado,
      ],
    );

    const ventaId = venta.rows[0].id;

    // ==========================
    // GUARDAR PRODUCTOS
    // ==========================
    for (const p of productos) {
      const productoId = p.id || p.producto_id;
      const cantidad = Number(p.cantidad);
      const precio = Number(p.precio);

      // FIX #1 — FOR UPDATE bloquea la fila durante la transacción
      // Evita race condition cuando dos ventas ocurren al mismo tiempo
      const producto = await client.query(
        `SELECT stock FROM productos WHERE id = $1 FOR UPDATE`,
        [productoId],
      );

      if (producto.rows.length === 0) {
        throw new Error("Producto no existe");
      }

      if (producto.rows[0].stock < cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${productoId}`);
      }

      const subtotal = cantidad * precio;

      await client.query(
        `INSERT INTO detalle_ventas
        (venta_id, producto_id, cantidad, precio, subtotal)
        VALUES ($1,$2,$3,$4,$5)`,
        [ventaId, productoId, cantidad, precio, subtotal],
      );

      // descontar stock
      await client.query(
        `UPDATE productos
         SET stock = stock - $1
         WHERE id = $2`,
        [cantidad, productoId],
      );
    }

    // ==========================
    // REGISTRAR CRÉDITO
    // ==========================
    if (metodo_pago === "credito") {
      await client.query(
        `INSERT INTO pagos_credito
        (venta_id, cliente_id, monto, metodo_pago, fecha)
        VALUES ($1,$2,$3,'credito',NOW())`,
        [ventaId, cliente_id, total],
      );
    }

    // ==========================
    // ACTUALIZAR SESIÓN POS
    // ==========================
    await client.query(
      `UPDATE sesiones_pos
   SET total_vendido = total_vendido + $1
   WHERE id = $2`,
      [total, sesion_id],
    );

    // ==========================
    // REGISTRAR INGRESO DE CAJA
    // FIX #2 — Se registra montoPagado, no total
    // Ej: venta de Q80 pagada con Q100 → entra Q100 a caja, no Q80
    // ==========================
    if (metodo_pago === "efectivo") {
      await client.query(
        `INSERT INTO movimientos_caja
     (sesion_id, tipo, monto, descripcion)
     VALUES ($1,'ingreso',$2,'Venta POS')`,
        [sesion_id, montoPagado],
      );
    }

    await client.query("COMMIT");

    res.json({
      mensaje: "Venta registrada correctamente",
      venta_id: ventaId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ERROR CREANDO VENTA:", error);

    res.status(500).json({
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ===============================
// OBTENER RECIBO DE VENTA
// ===============================
exports.obtenerRecibo = async (req, res) => {
  const { id } = req.params;

  try {
    const venta = await db.query(
      `SELECT 
        v.id,
        v.total,
        v.fecha,
        v.metodo_pago,
        v.estado,
        v.estado_pago,
        v.sesion_id,
        c.name AS cliente
      FROM ventas v
      LEFT JOIN clients c
      ON v.cliente_id = c.id
      WHERE v.id = $1`,
      [id],
    );

    if (venta.rows.length === 0) {
      return res.status(404).json({
        error: "Venta no encontrada",
      });
    }

    const productos = await db.query(
      `SELECT 
        d.cantidad,
        d.precio,
        d.subtotal,
        p.nombre
      FROM detalle_ventas d
      JOIN productos p
      ON d.producto_id = p.id
      WHERE d.venta_id = $1`,
      [id],
    );

    res.json({
      venta: venta.rows[0],
      productos: productos.rows,
    });
  } catch (error) {
    console.log("ERROR RECIBO:", error);

    res.status(500).json({
      error: "Error obteniendo recibo",
    });
  }
};

// ===============================
// DETALLE DE VENTA
// ===============================
exports.detalleVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        dv.cantidad,
        dv.precio,
        dv.subtotal,
        p.nombre
      FROM detalle_ventas dv
      JOIN productos p
      ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo detalle de venta",
    });
  }
};

// Detalle de productos de una venta para sesión POS
exports.productosVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        p.nombre,
        dv.cantidad,
        dv.precio,
        dv.subtotal
      FROM detalle_ventas dv
      JOIN productos p
      ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo productos",
    });
  }
};

// ===============================
// DEVOLVER VENTA
// ===============================
exports.devolverVenta = async (req, res) => {
  const { id } = req.params;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const venta = await client.query(`SELECT * FROM ventas WHERE id = $1`, [
      id,
    ]);

    if (venta.rows.length === 0) {
      return res.status(404).json({
        error: "Venta no encontrada",
      });
    }

    const ventaData = venta.rows[0];

    // verificar si ya fue devuelta
    if (ventaData.estado === "devuelta") {
      return res.status(400).json({
        error: "La venta ya fue devuelta",
      });
    }

    // ==========================
    // DEVOLVER PRODUCTOS AL STOCK
    // ==========================
    const productos = await client.query(
      `SELECT producto_id, cantidad
       FROM detalle_ventas
       WHERE venta_id = $1`,
      [id],
    );

    for (const p of productos.rows) {
      await client.query(
        `UPDATE productos
         SET stock = stock + $1
         WHERE id = $2`,
        [p.cantidad, p.producto_id],
      );
    }

    // ==========================
    // ELIMINAR CRÉDITO SI EXISTE
    // ==========================
    await client.query(
      `DELETE FROM pagos_credito
       WHERE venta_id = $1`,
      [id],
    );

    // ==========================
    // MARCAR VENTA COMO DEVUELTA
    // ==========================
    await client.query(
      `UPDATE ventas
   SET estado = 'devuelta',
       estado_pago = 'devuelto'
   WHERE id = $1`,
      [id],
    );

    // ==========================
    // FIX #3 — AJUSTAR total_vendido SIEMPRE, NO SOLO EN EFECTIVO
    // Una devolución de tarjeta o crédito también debe restar del total de la sesión
    // ==========================
    await client.query(
      `UPDATE sesiones_pos
       SET total_vendido = total_vendido - $1
       WHERE id = $2`,
      [ventaData.total, ventaData.sesion_id],
    );

    // El movimiento de egreso en caja solo aplica si fue efectivo
    if (ventaData.metodo_pago === "efectivo") {
      await client.query(
        `INSERT INTO movimientos_caja
     (sesion_id, tipo, monto, descripcion)
     VALUES ($1,'egreso',$2,'Devolución de venta')`,
        [ventaData.sesion_id, ventaData.total],
      );
    }

    await client.query("COMMIT");

    res.json({
      mensaje: "Venta devuelta correctamente",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.log(error);

    res.status(500).json({
      error: "Error devolviendo venta",
    });
  } finally {
    client.release();
  }
};