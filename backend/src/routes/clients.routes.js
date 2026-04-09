const express = require("express");
const router = express.Router();

const clientsController = require("../controllers/clients.controller");

router.get("/", clientsController.getClients);

router.post("/", clientsController.createClient);

router.put("/:id", clientsController.updateClient);

router.put("/:id/deactivate", clientsController.deactivateClient);

router.put("/:id/reactivate", clientsController.reactivateClient);

module.exports = router;