// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

 const sendMessage  = async(mobile,message) => {

    try {
        
 await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: "+91"+mobile,
  });

  console.log(message.body);
  return true
    } catch (error) {
         console.log("twilio",error)  
         return false
    }
}

module.exports = {sendMessage}