const express = require("express");
const AdminController = require("../controllers/AdminController");
const { verifyToken, isAdmin } = require("../services/jwt");

const router = express.Router();

router.get("/get", verifyToken, AdminController.getUser);
router.put("/update", verifyToken, AdminController.updateUser);
router.put("/avatar", verifyToken, AdminController.updateAvatar);

// Management Routes
router.get("/bookings", verifyToken, isAdmin, AdminController.getAllBookings);
router.get("/stats", verifyToken, isAdmin, AdminController.getStats);
router.post("/flights/add", verifyToken, isAdmin, AdminController.addFlight);
router.post("/hotels/add", verifyToken, isAdmin, AdminController.addHotel);
router.post("/buses/add", verifyToken, isAdmin, AdminController.addBus);
router.post("/trains/add", verifyToken, isAdmin, AdminController.addTrain);

module.exports = router;