const express = require("express");
const { searchHotels, getHotelCitySuggestions, getHotelIdDetails } = require("../controllers/HotelController");
const router = express.Router();

// Hotel Search API route
router.get("/search", searchHotels);

// Specific hotel details/offers
router.get("/:hotelId/offers", getHotelIdDetails);

// City Suggest API route
router.get("/cities/suggest", getHotelCitySuggestions);

module.exports = router;