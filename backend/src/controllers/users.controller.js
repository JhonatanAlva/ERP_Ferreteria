const usersService = require("../services/users.service");

async function getUsers(req, res) {
  try {
    const companyId = req.user.company_id;

    const users = await usersService.getUsers(companyId);

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo usuarios",
    });
  }
}

async function createUser(req, res) {
  try {
    const data = {
      ...req.body,
      company_id: req.user.company_id,
    };

    const user = await usersService.createUser(data);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error creando usuario",
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const user = await usersService.updateUser(id, req.body);

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error actualizando usuario",
    });
  }
}

async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;

    const user = await usersService.toggleUserStatus(id);

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error cambiando estado del usuario",
    });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
};
