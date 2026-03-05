const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {timestamps: true})

module.exports = OTPModel = mongoose.model("OTP", OTPSchema)