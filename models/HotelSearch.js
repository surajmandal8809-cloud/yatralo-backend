const mongoose = require("mongoose");

const hotelSearchSchema = new mongoose.Schema(
  {
    city: String,
    cityCode: String,
    checkInDate: String,
    checkOutDate: String,
    guests: Number,
    resultsCount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HotelSearch", hotelSearchSchema);