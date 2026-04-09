const db = require("../config/database");
const bcrypt = require("bcrypt");

async function getUsers(companyId) {
  const result = await db.query(
    `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role_id,
      r.name as role,
      u.active,
      u.created_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.company_id = $1
    ORDER BY u.id DESC
  `,
    [companyId],
  );

  return result.rows;
}

async function createUser(data) {
  const { company_id, role_id, name, email, password } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    `
    INSERT INTO users (company_id,role_id,name,email,password)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id,name,email
  `,
    [company_id, role_id, name, email, hashedPassword],
  );

  return result.rows[0];
}

async function updateUser(id, data) {
  const { name, email, role_id, password } = data;

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      UPDATE users
      SET name = $1,
          email = $2,
          role_id = $3,
          password = $4
      WHERE id = $5
      RETURNING *
    `,
      [name, email, role_id, hashedPassword, id],
    );

    return result.rows[0];
  } else {
    const result = await db.query(
      `
      UPDATE users
      SET name = $1,
          email = $2,
          role_id = $3
      WHERE id = $4
      RETURNING *
    `,
      [name, email, role_id, id],
    );

    return result.rows[0];
  }
}

async function deleteUser(id) {
  await db.query(
    `
    DELETE FROM users
    WHERE id=$1
  `,
    [id],
  );
}

async function toggleUserStatus(id) {
  const user = await db.query(
    "SELECT role_id, active FROM users WHERE id = $1",
    [id],
  );

  if (!user.rows.length) {
    throw new Error("Usuario no encontrado");
  }

  if (user.rows[0].role_id === 1) {
    throw new Error("No puedes desactivar el super admin");
  }

  const result = await db.query(
    `
    UPDATE users
    SET active = NOT active
    WHERE id = $1
    RETURNING id, active
  `,
    [id],
  );

  return result.rows[0];
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
