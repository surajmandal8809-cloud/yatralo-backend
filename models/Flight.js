const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema(
{
  flightNumber: {
    type: String,
    required: true,
    trim: true
  },

  airline: {
    type: String,
    required: true,
    trim: true
  },

  origin: {
    type: String, // airport code (DEL, BOM etc)
    required: true,
    uppercase: true
  },

  destination: {
    type: String,
    required: true,
    uppercase: true
  },

  departureTime: {
    type: Date,
    required: true
  },

  arrivalTime: {
    type: Date,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  seatsAvailable: {
    type: Number,
    default: 60
  },

  status: {
    type: String,
    enum: ["scheduled", "delayed", "cancelled"],
    default: "scheduled"
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Flight", FlightSchema);