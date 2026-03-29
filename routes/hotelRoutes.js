const express = require("express");
const { searchHotels, getHotelCitySuggestions } = require("../controllers/HotelController");
const router = express.Router();

// Hotel Search API route
router.get("/search", searchHotels);

// City Suggest API route
router.get("/cities/suggest", getHotelCitySuggestions);

module.exports = router;