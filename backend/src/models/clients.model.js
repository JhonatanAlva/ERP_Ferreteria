const pool = require("../config/database");

// ============================
// OBTENER CLIENTES + CREDITO
// ============================
const getClients = async () => {
  const result = await pool.query(`
    
    SELECT
      c.*,

      COALESCE(
        SUM(v.total - v.monto_pagado),0
      ) AS credito_pendiente

    FROM clients c

    LEFT JOIN ventas v
      ON c.id = v.cliente_id
      AND v.estado_pago = 'pendiente'
      AND v.estado = 'activa'

    GROUP BY c.id

    ORDER BY c.id DESC

  `);

  return result.rows;
};

// ============================
// CREAR CLIENTE
// ============================

const createClient = async (client) => {
  const { name, phone, email, address, company_id } = client;

  const result = await pool.query(
    `INSERT INTO clients (name, phone, email, address, company_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [name, phone, email, address, company_id],
  );

  return result.rows[0];
};

// ============================
// ACTUALIZAR CLIENTE
// ============================

const updateClient = async (id, client) => {
  const { name, phone, email, address } = client;

  const result = await pool.query(
    `UPDATE clients
     SET name=$1, phone=$2, email=$3, address=$4
     WHERE id=$5
     RETURNING *`,
    [name, phone, email, address, id],
  );

  return result.rows[0];
};

// ============================
// SOFT DELETE
// ============================

const deleteClient = async (id) => {
  await pool.query(
    `UPDATE clients
     SET active=false
     WHERE id=$1`,
    [id],
  );
};

// ============================
// DESACTIVAR CLIENTE
// ============================

const deactivateClient = async (id) => {
  const query = `
    UPDATE clients
    SET active = false
    WHERE id = $1
  `;

  await pool.query(query, [id]);
};

// ============================
// REACTIVAR CLIENTE
// ============================

const reactivateClient = async (id) => {
  const query = `
    UPDATE clients
    SET active = true
    WHERE id = $1
  `;

  await pool.query(query, [id]);
};

// ============================

module.exports = {
  getClients,
  createClient,
  updateClient,
  deactivateClient,
  deleteClient,
  reactivateClient,
};
