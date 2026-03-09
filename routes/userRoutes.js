const express = require("express");
const UserController = require("../controllers/UserController");
const { verifyToken } = require("../services/jwt");

const router = express.Router();

router.get("/get", verifyToken, UserController.getUser);
router.put("/update", verifyToken, UserController.updateUser);
router.put("/avatar", verifyToken, UserController.updateAvatar);

module.exports = userRoutes = router;