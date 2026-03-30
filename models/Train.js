const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true },
  trainName: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  seatsAvailable: { type: Number, default: 120 }
}, { timestamps: true });

module.exports = mongoose.model("Train", TrainSchema);
