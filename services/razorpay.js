const razorpay = require('razorpay');

const instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (amount) => {
    const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
    };
    try {
        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createOrder
}

