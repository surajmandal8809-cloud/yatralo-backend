const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  smtp: {
    host: { type: String, default: "" },
    port: { type: String, default: "" },
    user: { type: String, default: "" },
    password: { type: String, default: "" },
    fromEmail: { type: String, default: "" }
  },
  aviationStack: {
    apiKey: { type: String, default: "" }
  },
  googleClient: {
    clientId: { type: String, default: "" },
    clientSecret: { type: String, default: "" }
  },
  twilio: {
    accountSid: { type: String, default: "" },
    authToken: { type: String, default: "" },
    phoneNumber: { type: String, default: "" }
  },
  amadeus: {
    clientId: { type: String, default: "" },
    clientSecret: { type: String, default: "" },
    baseUrl: { type: String, default: "https://test.api.amadeus.com" }
  },
  razorpay: {
    keyId: { type: String, default: "" },
    keySecret: { type: String, default: "" }
  },
  gemini: {
    apiKey: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", SettingSchema);
