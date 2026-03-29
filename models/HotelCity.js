const mongoose = require("mongoose");

const HotelCitySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    iataCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    country: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    type: {
        type: String,
        default: "CITY"
    }
  },
  { timestamps: true }
);

/* Multi-field index for faster city search */
HotelCitySchema.index({ city: 1, iataCode: 1 });

module.exports = mongoose.model("HotelCity", HotelCitySchema);
