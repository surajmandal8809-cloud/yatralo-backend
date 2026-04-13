const Razorpay = require("razorpay");
const { getSettings } = require("./settings");
const crypto = require("crypto");

const getRazorpayClient = async () => {
  const settings = await getSettings();
  const keyId = settings?.razorpay?.keyId;
  const keySecret = settings?.razorpay?.keySecret;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay configuration is missing.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

exports.createOrder = async (amount) => {
  const razorpay = await getRazorpayClient();
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  return await razorpay.orders.create(options);
};

exports.verifySignature = async (orderId, paymentId, signature) => {
  const settings = await getSettings();
  const keySecret = settings?.razorpay?.keySecret;

  const hmac = crypto.createHmac("sha256", keySecret);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
};