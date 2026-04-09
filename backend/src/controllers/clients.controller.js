const clientsModel = require("../models/clients.model");


// =========================
// GET CLIENTS (CON CREDITO)
// =========================

const getClients = async (req, res) => {

  try {

    const clients = await clientsModel.getClients();

    res.json(clients);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo clientes"
    });

  }

};


// =========================
// CREATE CLIENT
// =========================

const createClient = async (req, res) => {

  try {

    const { name, phone, email, address } = req.body;

    if (!name) {

      return res.status(400).json({
        error: "El nombre es obligatorio"
      });

    }

    const client = await clientsModel.createClient({
      name,
      phone,
      email,
      address
    });

    res.json({
      message: "Cliente creado correctamente",
      client
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error creando cliente"
    });

  }

};


// =========================
// UPDATE CLIENT
// =========================

const updateClient = async (req, res) => {

  try {

    const { id } = req.params;

    const client = await clientsModel.updateClient(
      id,
      req.body
    );

    res.json({
      message: "Cliente actualizado",
      client
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error actualizando cliente"
    });

  }

};


// =========================
// DESACTIVAR CLIENT
// =========================

const deactivateClient = async (req, res) => {

  try {

    const { id } = req.params;

    await clientsModel.deactivateClient(id);

    res.json({
      message: "Cliente desactivado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error desactivando cliente"
    });

  }

};


// =========================
// REACTIVAR CLIENT
// =========================

const reactivateClient = async (req, res) => {

  try {

    const { id } = req.params;

    await clientsModel.reactivateClient(id);

    res.json({
      message: "Cliente reactivado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error reactivando cliente"
    });

  }

};


// =========================

module.exports = {
  getClients,
  createClient,
  updateClient,
  deactivateClient,
  reactivateClient
};
