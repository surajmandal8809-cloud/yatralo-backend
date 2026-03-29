const express = require("express");
const TrainController = require("../controllers/TrainController");

const router = express.Router();

router.get("/search", TrainController.searchTrains);

module.exports = router;
