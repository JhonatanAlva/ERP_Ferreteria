const express = require("express");
const router = express.Router();

const rolesController = require("../controllers/roles.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/", authMiddleware, rolesController.getRoles);

module.exports = router;