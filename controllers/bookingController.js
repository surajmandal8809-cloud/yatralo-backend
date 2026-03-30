const Booking = require("../models/Booking");
const PaymentModel = require("../models/Payment");
const { createOrder, verifySignature } = require("../services/razorpay");


// ✅ CREATE BOOKING + ORDER
exports.createBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const b = req.body;

        // 1. Create Booking (PENDING)
        const booking = await Booking.create({
            userId,
            type: b.type,
            bookingRef: `YT${Math.floor(100000 + Math.random() * 900000)}`,
            from: b.fromCode || b.from,
            to: b.toCode || b.to,
            travelDate: b.travelDate,
            totalPrice: b.totalPrice,
            status: "pending",
            providerName: b.providerName,
            passengers: b.passengers || [],
            details: b.details || {}
        });

        // 2. Create Razorpay Order
        const order = await createOrder(booking.totalPrice);

        // 3. Save Payment Record
        await PaymentModel.create({
            user: userId,
            booking: booking._id, // 🔥 IMPORTANT LINK
            amount: booking.totalPrice,
            razorpayOrderId: order.id,
            status: "created"
        });

        // 4. Send response
        res.status(201).json({
            success: true,
            bookingId: booking._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        // 1. Verify Signature
        const isValid = verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // 2. Update Booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = "confirmed";
        booking.paymentDetails = {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
        };

        await booking.save();

        // 3. Update Payment Record
        await PaymentModel.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                status: "paid"
            }
        );

        // 🚀 4. Send Confirmation Email to Traveller
        if (req.user?.email) {
            try {
                const { sendBookingConfirmationEmail } = require("../services/mail");
                await sendBookingConfirmationEmail(req.user.email, booking);
            } catch (err) {
                console.error("Email Sending Error:", err);
            }
        }

        res.json({ success: true, booking });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
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

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Get Bookings Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
