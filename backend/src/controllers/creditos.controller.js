const db = require("../config/database");

// =============================
// OBTENER TODAS LAS CUENTAS POR COBRAR
// =============================
exports.obtenerCreditos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        v.id,
        c.name as cliente,
        v.cliente_id,
        v.total,
        v.monto_pagado,
        (v.total - v.monto_pagado) as saldo,
        v.fecha
      FROM ventas v
      JOIN clients c
      ON v.cliente_id = c.id
      WHERE v.estado_pago = 'pendiente'
      AND v.estado = 'activa'
      ORDER BY v.fecha DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo créditos",
    });
  }
};

// =============================
// CREDITOS POR CLIENTE
// =============================
exports.creditosCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        v.id,
        v.total,
        v.monto_pagado,
        (v.total - v.monto_pagado) as saldo,
        v.fecha,
        c.name as cliente
      FROM ventas v
      JOIN clients c
      ON v.cliente_id = c.id
      WHERE v.cliente_id = $1
      AND v.estado_pago = 'pendiente'
      AND v.estado = 'activa'
      ORDER BY v.fecha DESC
    `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo créditos del cliente",
    });
  }
};

// =============================
// HISTORIAL DE PAGOS
// =============================
exports.historialPagos = async (req, res) => {
  const { venta_id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        monto,
        fecha
      FROM pagos_credito
      WHERE venta_id = $1
      ORDER BY fecha DESC
    `,
      [venta_id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo historial",
    });
  }
};

// =============================
// PAGAR CREDITO
// =============================
exports.pagarCredito = async (req, res) => {
  const { venta_id, cliente_id, monto } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const venta = await client.query(`SELECT * FROM ventas WHERE id = $1`, [
      venta_id,
    ]);

    if (venta.rows.length === 0) {
      throw new Error("Venta no encontrada");
    }

    if (venta.rows[0].estado === "anulada") {
      throw new Error("No se puede pagar una venta anulada");
    }

    const saldo = venta.rows[0].total - venta.rows[0].monto_pagado;

    if (monto > saldo) {
      throw new Error("El pago supera el saldo pendiente");
    }

    await client.query(
      `INSERT INTO pagos_credito
       (venta_id, cliente_id, monto, fecha)
       VALUES ($1,$2,$3,NOW())`,
      [venta_id, cliente_id, monto],
    );

    await client.query(
      `UPDATE ventas
       SET monto_pagado = monto_pagado + $1
       WHERE id = $2`,
      [monto, venta_id],
    );

    await client.query(
      `UPDATE ventas
       SET estado_pago = 'pagado'
       WHERE id = $1
       AND monto_pagado >= total`,
      [venta_id],
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Pago registrado correctamente",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      error: error.message,
    });
  } finally {
    client.release();
  }
};
