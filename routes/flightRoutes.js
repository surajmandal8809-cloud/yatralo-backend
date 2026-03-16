const express = require("express");
const FlightController = require("../controllers/FlightController");

const router = express.Router();

router.get("/search", FlightController.searchFlights);
router.get("/realtime", FlightController.getRealtimeFlights);
router.post("/sync", FlightController.saveFlights);

module.exports = router;
