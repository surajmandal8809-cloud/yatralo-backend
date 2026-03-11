const { searchFlightOffers } = require("../services/amadeus");

const searchFlights = async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      adults = "1",
      max = "20",
      nonstop = "false",
      currency = "INR",
    } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        status: false,
        message: "from, to and date are required query params.",
      });
    }

    const offers = await searchFlightOffers({
      originLocationCode: String(from).toUpperCase(),
      destinationLocationCode: String(to).toUpperCase(),
      departureDate: date,
      adults: Math.max(1, Number(adults) || 1),
      max: Math.max(1, Math.min(50, Number(max) || 20)),
      nonStop: nonstop === "true",
      currencyCode: currency || "INR",
    });

    return res.status(200).json({
      status: true,
      message: "Flight offers fetched successfully.",
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch flight offers.",
    });
  }
};

const searchCities = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.length < 2) {
      return res.status(200).json({ status: true, data: [] });
    }
    const { searchCities: findCities } = require("../services/amadeus");
    const cities = await findCities(keyword);
    return res.status(200).json({ status: true, data: cities });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  searchFlights,
  searchCities,
};
