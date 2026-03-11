const express = require("express");
const HotelController = require("../controllers/HotelController");

const router = express.Router();

router.get("/search", HotelController.searchHotels);

module.exports = router;
