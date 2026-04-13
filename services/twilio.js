const twilio = require("twilio");
const { getSettings } = require("./settings");

const sendMessage = async (mobile, message) => {
  try {
    const settings = await getSettings();
    const twilioConfig = settings?.twilio;
    
    const accountSid = twilioConfig?.accountSid;
    const authToken = twilioConfig?.authToken;
    const fromNumber = twilioConfig?.phoneNumber;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio configuration is missing. Please set it in Admin Settings.");
      return false;
    }

    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: "+91" + mobile,
    });

    console.log("SMS sent successfully to:", mobile);
    return true;
  } catch (error) {
    console.error("Twilio error:", error.message);
    return false;
  }
};

module.exports = { sendMessage };