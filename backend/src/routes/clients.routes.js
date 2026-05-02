const express = require("express");
const router = express.Router();

const clientsController = require("../controllers/clients.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/", authMiddleware, clientsController.getClients);
router.post("/", authMiddleware, clientsController.createClient);
router.put("/:id", authMiddleware, clientsController.updateClient);
router.put("/:id/deactivate", authMiddleware, clientsController.deactivateClient);
router.put("/:id/reactivate", authMiddleware, clientsController.reactivateClient);

module.exports = router;