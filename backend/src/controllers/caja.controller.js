const db = require("../config/database");

exports.resumenCaja = async (req,res)=>{

  const { sesion_id } = req.params;

  try{

    const efectivo = await db.query(`
      SELECT COALESCE(SUM(total),0) as total
      FROM ventas
      WHERE sesion_id = $1
      AND metodo_pago = 'efectivo'
    `,[sesion_id]);

    const credito = await db.query(`
      SELECT COALESCE(SUM(total),0) as total
      FROM ventas
      WHERE sesion_id = $1
      AND metodo_pago = 'credito'
    `,[sesion_id]);

    const result = await db.query(
      `SELECT monto_inicial
       FROM sesiones_pos
       WHERE id = $1`,
      [sesion_id]
    );

    const montoInicial = result.rows[0].monto_inicial;

    res.json({

      monto_inicial:montoInicial,
      ventas_efectivo:efectivo.rows[0].total,
      ventas_credito:credito.rows[0].total,
      total_caja:
        Number(montoInicial) +
        Number(efectivo.rows[0].total)

    });

  }catch(error){

    res.status(500).json({
      error:"Error obteniendo resumen de caja"
    });

  }

};