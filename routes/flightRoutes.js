const express = require("express");
const FlightController = require("../controllers/FlightController");

const router = express.Router();

router.get("/search", FlightController.searchFlights);
router.get("/cities", FlightController.searchCities);

module.exports = router;
