const db = require("../config/database");

// ===============================
// ABRIR SESIÓN
// ===============================
exports.abrirSesion = async (req, res) => {
  const { usuario_id, monto_inicial } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO sesiones_pos
      (usuario_id, estado, monto_inicial)
      VALUES ($1,'abierta',$2)
      RETURNING *`,
      [usuario_id, monto_inicial || 0],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error abriendo sesión",
    });
  }
};

// ===============================
// CERRAR SESIÓN
// ===============================
exports.cerrarSesion = async (req, res) => {
  const { id } = req.params;
  const { dinero_contado } = req.body;

  try {
    // SOLO EFECTIVO Y SOLO VENTAS ACTIVAS
    const ventas = await db.query(
      `SELECT COALESCE(SUM(total),0) as efectivo
       FROM ventas
       WHERE sesion_id = $1
       AND metodo_pago = 'efectivo'
       AND estado = 'activa'`,
      [id],
    );

    const efectivo = Number(ventas.rows[0].efectivo);

    await db.query(
      `UPDATE sesiones_pos
       SET estado = 'cerrada',
           fecha_cierre = NOW(),
           dinero_contado = $1,
           total_vendido = $2
       WHERE id = $3`,
      [dinero_contado, efectivo, id],
    );

    res.json({
      mensaje: "Sesión cerrada correctamente",
      ventas_efectivo: efectivo,
    });
  } catch (error) {
    console.log("ERROR CERRANDO SESION:", error);

    res.status(500).json({
      error: "Error cerrando sesión",
    });
  }
};

// ===============================
// OBTENER SESIONES
// ===============================
exports.obtenerSesiones = async (req, res) => {
  try {
    const result = await db.query(`
      
      SELECT
        s.id,
        s.estado,
        s.fecha_inicio,
        s.fecha_cierre,
        s.monto_inicial,
        s.dinero_contado,

        COALESCE(
          (
            SELECT SUM(total)
            FROM ventas
            WHERE sesion_id = s.id
            AND estado = 'activa'
          ),0
        ) as total_vendido

      FROM sesiones_pos s
      ORDER BY s.id DESC

    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo sesiones",
    });
  }
};

// ===============================
// OBTENER SESIÓN
// ===============================
exports.obtenerSesion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        s.id,
        s.estado,
        s.fecha_inicio,
        s.fecha_cierre,
        s.monto_inicial,
        s.dinero_contado,
        u.name as usuario,

        COALESCE(
          (
            SELECT SUM(total)
            FROM ventas
            WHERE sesion_id = s.id
            AND estado = 'activa'
          ),0
        ) as total_vendido

      FROM sesiones_pos s
      LEFT JOIN users u
      ON s.usuario_id = u.id
      WHERE s.id = $1
      `,
      [id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo sesión",
    });
  }
};

// =============================
// RESUMEN DE CAJA
// =============================
exports.resumenSesion = async (req, res) => {
  const { id } = req.params;

  try {
    const sesion = await db.query(
      `SELECT COALESCE(monto_inicial,0) AS monto_inicial
       FROM sesiones_pos
       WHERE id = $1`,
      [id],
    );

    if (sesion.rows.length === 0) {
      return res.status(404).json({
        error: "Sesión no encontrada",
      });
    }

    const montoInicial = Number(sesion.rows[0].monto_inicial);

    const efectivo = await db.query(
      `SELECT COALESCE(SUM(total),0) total
       FROM ventas
       WHERE sesion_id = $1
       AND metodo_pago = 'efectivo'
       AND estado = 'activa'`,
      [id],
    );

    const tarjeta = await db.query(
      `SELECT COALESCE(SUM(total),0) total
       FROM ventas
       WHERE sesion_id = $1
       AND metodo_pago = 'tarjeta'
       AND estado = 'activa'`,
      [id],
    );

    const credito = await db.query(
      `SELECT COALESCE(SUM(total),0) total
       FROM ventas
       WHERE sesion_id = $1
       AND metodo_pago = 'credito'
       AND estado = 'activa'`,
      [id],
    );

    const ventasEfectivo = Number(efectivo.rows[0].total);
    const ventasTarjeta = Number(tarjeta.rows[0].total);
    const ventasCredito = Number(credito.rows[0].total);

    res.json({
      dinero_inicial: montoInicial,

      ventas_efectivo: ventasEfectivo,

      ventas_tarjeta: ventasTarjeta,

      ventas_credito: ventasCredito,

      total_vendido: ventasEfectivo + ventasTarjeta + ventasCredito,

      esperado_caja: montoInicial + ventasEfectivo,
    });
  } catch (error) {
    console.log("ERROR RESUMEN SESION:", error);

    res.status(500).json({
      error: "Error obteniendo resumen de sesión",
    });
  }
};

// ===============================
// VENTAS DE UNA SESIÓN
// ===============================
exports.ventasSesion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        v.id,
        v.total,
        v.metodo_pago,
        v.estado_pago,
        v.estado,
        v.fecha,
        c.name as cliente
      FROM ventas v
      LEFT JOIN clients c
      ON v.cliente_id = c.id
      WHERE v.sesion_id = $1
      ORDER BY v.fecha DESC
      `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo ventas de sesión",
    });
  }
};

// ===============================
// ESTADISTICAS DE SESION
// ===============================
exports.estadisticasSesion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        COUNT(*) as total_ventas,
        COALESCE(SUM(total),0) as ventas_totales,
        COALESCE(SUM(CASE WHEN metodo_pago='efectivo' THEN total END),0) as efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago='tarjeta' THEN total END),0) as tarjeta,
        COALESCE(SUM(CASE WHEN metodo_pago='credito' THEN total END),0) as credito
      FROM ventas
      WHERE sesion_id = $1
      AND estado = 'activa'
      `,
      [id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo estadísticas",
    });
  }
};

// ===============================
// MOVIMIENTOS DE CAJA
// ===============================
exports.movimientosCaja = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        tipo,
        monto,
        descripcion,
        fecha
      FROM movimientos_caja
      WHERE sesion_id = $1
      ORDER BY fecha DESC
      `,
      [id]
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo movimientos de caja"
    });
  }
};