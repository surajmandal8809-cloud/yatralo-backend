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

// Flights
router.get("/flights", verifyToken, isAdmin, AdminController.getFlights);
router.post("/flights/add", verifyToken, isAdmin, AdminController.addFlight);
router.put("/flights/:id", verifyToken, isAdmin, AdminController.updateFlight);
router.delete("/flights/:id", verifyToken, isAdmin, AdminController.deleteFlight);

// Hotels
router.get("/hotels", verifyToken, isAdmin, AdminController.getHotels);
router.post("/hotels/add", verifyToken, isAdmin, AdminController.addHotel);
router.put("/hotels/:id", verifyToken, isAdmin, AdminController.updateHotel);
router.delete("/hotels/:id", verifyToken, isAdmin, AdminController.deleteHotel);

// Buses
router.get("/buses", verifyToken, isAdmin, AdminController.getBuses);
router.post("/buses/add", verifyToken, isAdmin, AdminController.addBus);
router.put("/buses/:id", verifyToken, isAdmin, AdminController.updateBus);
router.delete("/buses/:id", verifyToken, isAdmin, AdminController.deleteBus);

// Trains
router.get("/trains", verifyToken, isAdmin, AdminController.getTrains);
router.post("/trains/add", verifyToken, isAdmin, AdminController.addTrain);
router.put("/trains/:id", verifyToken, isAdmin, AdminController.updateTrain);
router.delete("/trains/:id", verifyToken, isAdmin, AdminController.deleteTrain);

router.get("/settings", verifyToken, isAdmin, AdminController.getSettings);
router.put("/settings", verifyToken, isAdmin, AdminController.updateSettings);


module.exports = router;