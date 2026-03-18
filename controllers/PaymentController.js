const PaymentModel = require('../models/Payment');
const { createOrder } = require('../services/razorpay');

const createPayment = async (req, res) => {
    const { amount } = req.body;      
    try {
        const order = await createOrder(amount);
        const payment = new PaymentModel({
            user: req.user._id,
            amount,
            razorpayOrderId: order.id
        });
        await payment.save();
        res.status(201).json({ orderId: order.id, amount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }   
};

module.exports = {
    createPayment
};