const Booking = require("../models/Booking");
const PaymentModel = require('../models/Payment');
const { createOrder } = require('../services/razorpay');

exports.createBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const b = req.body;
        console.log("Booking Request Body:", b, "User ID:", userId);
        const booking = new Booking({
            userId,
            type: b.type,
            bookingRef: b.bookingRef || `YT${Math.floor(100000 + Math.random() * 900000)}`,
            from: b.fromCode || b.from,
            to: b.toCode || b.to,
            travelDate: b.travelDate,
            totalPrice: b.totalPrice,
            status: 'pending',
            providerName: b.providerName,
            passengers: b.passengers || 1,
            details: b.details || {}
        });
        await booking.save();
       
        const order = await createOrder(booking.totalPrice);
        const payment = new PaymentModel({
            user: userId,
            amount: booking.totalPrice,
            razorpayOrderId: order.id
        });
        await payment.save();

        res.status(201).json({ success: true, booking, orderId: order.id });
    } catch (error) {
        console.error("Booking Create Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: 'cancelled' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
