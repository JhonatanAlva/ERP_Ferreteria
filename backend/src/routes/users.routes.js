const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/", authMiddleware, usersController.getUsers);
router.post("/", authMiddleware, usersController.createUser);
router.put("/:id", authMiddleware, usersController.updateUser);
router.patch("/:id/status", authMiddleware, usersController.toggleUserStatus);

module.exports = router;