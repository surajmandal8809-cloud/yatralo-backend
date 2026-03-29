const express = require("express");
const BusController = require("../controllers/BusController");

const router = express.Router();

router.get("/search", BusController.searchBuses);

module.exports = router;
