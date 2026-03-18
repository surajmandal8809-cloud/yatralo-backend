const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["flight", "train", "bus", "hotel", "common"],
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "disabled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", CouponSchema);
