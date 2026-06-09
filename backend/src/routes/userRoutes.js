
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/me", verifyToken, usersController.getProfile);
router.put("/me", verifyToken, usersController.updateProfile);

module.exports = router;
