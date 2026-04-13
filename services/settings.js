const Setting = require("../models/Setting");

let cachedSettings = null;

const getSettings = async () => {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // Merge with .env defaults if DB values are empty
    const s = settings.toObject ? settings.toObject() : settings;
    
    const finalSettings = {
      smtp: {
        host: s.smtp?.host || process.env.SMTP_HOST || "",
        port: s.smtp?.port || process.env.SMTP_PORT || "",
        user: s.smtp?.user || process.env.SMTP_EMAIL_USER || "",
        password: s.smtp?.password || process.env.SMTP_EMAIL_PASSWORD || "",
        fromEmail: s.smtp?.fromEmail || process.env.SMTP_EMAIL || ""
      },
      aviationStack: {
        apiKey: s.aviationStack?.apiKey || process.env.AVIATION_STACK_API_KEY || ""
      },
      googleClient: {
        clientId: s.googleClient?.clientId || process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: s.googleClient?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || ""
      },
      twilio: {
        accountSid: s.twilio?.accountSid || process.env.TWILIO_ACCOUNT_SID || "",
        authToken: s.twilio?.authToken || process.env.TWILIO_AUTH_TOKEN || "",
        phoneNumber: s.twilio?.phoneNumber || process.env.TWILIO_PHONE_NUMBER || ""
      },
      amadeus: {
        clientId: s.amadeus?.clientId || process.env.AMADEUS_CLIENT_ID || "",
        clientSecret: s.amadeus?.clientSecret || process.env.AMADEUS_CLIENT_SECRET || "",
        baseUrl: s.amadeus?.baseUrl || process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com"
      },
      razorpay: {
        keyId: s.razorpay?.keyId || process.env.RAZORPAY_KEY_ID || "",
        keySecret: s.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET || ""
      },
      gemini: {
        apiKey: s.gemini?.apiKey || process.env.GEMINI_API_KEY || ""
      }
    };

    cachedSettings = finalSettings;
    return finalSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

const clearSettingsCache = () => {
  cachedSettings = null;
};

module.exports = {
  getSettings,
  clearSettingsCache
};
