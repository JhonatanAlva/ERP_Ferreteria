const db = require("../config/database");

// ===============================
// ABRIR SESIÓN
// ===============================
// El usuario_id viene del token JWT, no del body.
// Así un cajero no puede abrir sesión en nombre de otro.
// También se bloquea abrir una segunda sesión si ya tiene una abierta.
exports.abrirSesion = async (req, res) => {
  const usuario_id = req.user.id; // viene del middleware JWT
  const { monto_inicial } = req.body;

  try {
    // Verificar que el usuario no tenga ya una sesión abierta
    const sesionActiva = await db.query(
      `SELECT id FROM sesiones_pos
       WHERE usuario_id = $1 AND estado = 'abierta'`,
      [usuario_id],
    );

    if (sesionActiva.rows.length > 0) {
      return res.status(400).json({
        error: "Ya tienes una sesión abierta",
        sesion_id: sesionActiva.rows[0].id,
      });
    }

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
// Se verifica que la sesión pertenezca al usuario del token antes de cerrar.
exports.cerrarSesion = async (req, res) => {
  const { id } = req.params;
  const { dinero_contado } = req.body;
  const usuario_id = req.user.id; // viene del middleware JWT

  try {
    // Verificar que la sesión pertenece a este usuario
    const sesion = await db.query(
      `SELECT id FROM sesiones_pos
       WHERE id = $1 AND usuario_id = $2 AND estado = 'abierta'`,
      [id, usuario_id],
    );

    if (sesion.rows.length === 0) {
      return res.status(403).json({
        error: "No tienes permiso para cerrar esta sesión o ya está cerrada",
      });
    }

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
// Cada usuario solo ve sus propias sesiones.
// Si el usuario es admin (rol 'admin'), ve todas.
exports.obtenerSesiones = async (req, res) => {
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

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
          (SELECT SUM(total) FROM ventas
           WHERE sesion_id = s.id AND estado = 'activa'), 0
        ) as total_vendido
      FROM sesiones_pos s
      LEFT JOIN users u ON s.usuario_id = u.id
      WHERE (
        -- Sesión activa: solo el dueño la ve, sin importar el rol
        (s.estado = 'abierta' AND s.usuario_id = $1)
        OR
        -- Sesiones cerradas: admin ve todas, empleado solo las suyas
        (s.estado = 'cerrada' AND ($2 = true OR s.usuario_id = $1))
      )
      ORDER BY s.id DESC
      `,
      [usuario_id, esAdmin]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error obteniendo sesiones" });
  }
};

// ===============================
// OBTENER SESIÓN
// ===============================
// Un cajero solo puede ver su propia sesión.
exports.obtenerSesion = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

  try {
    const result = await db.query(
      `
      SELECT
        s.id,
        s.usuario_id,
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
      LEFT JOIN users u ON s.usuario_id = u.id
      WHERE s.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const sesion = result.rows[0];

    // Bloquear acceso si no es el dueño ni admin
    if (!esAdmin && sesion.usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No tienes permiso para ver esta sesión",
      });
    }

    res.json(sesion);
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
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

  try {
    const sesion = await db.query(
      `SELECT usuario_id, COALESCE(monto_inicial,0) AS monto_inicial
       FROM sesiones_pos
       WHERE id = $1`,
      [id],
    );

    if (sesion.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    // Bloquear acceso si no es el dueño ni admin
    if (!esAdmin && sesion.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No tienes permiso para ver esta sesión",
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
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

  try {
    // Verificar propiedad de la sesión
    const sesion = await db.query(
      `SELECT usuario_id FROM sesiones_pos WHERE id = $1`,
      [id],
    );

    if (sesion.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    if (!esAdmin && sesion.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No tienes permiso para ver estas ventas",
      });
    }

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
      LEFT JOIN clients c ON v.cliente_id = c.id
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
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

  try {
    const sesion = await db.query(
      `SELECT usuario_id FROM sesiones_pos WHERE id = $1`,
      [id],
    );

    if (sesion.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    if (!esAdmin && sesion.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No tienes permiso para ver estas estadísticas",
      });
    }

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
  const usuario_id = req.user.id;
  const esAdmin = req.user.role_id === 1 || req.user.role_id === 2;

  try {
    const sesion = await db.query(
      `SELECT usuario_id FROM sesiones_pos WHERE id = $1`,
      [id],
    );

    if (sesion.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    if (!esAdmin && sesion.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        error: "No tienes permiso para ver estos movimientos",
      });
    }

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
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo movimientos de caja",
    });
  }
};