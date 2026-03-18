const Coupon = require("../models/Coupon");

const getCoupons = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { status: "active" };
    
    if (type) {
      query.$or = [{ type: type }, { type: "common" }];
    }

    const coupons = await Coupon.find(query).sort({ expiryDate: 1 });

    return res.json({
      status: true,
      data: coupons,
    });
  } catch (error) {
    console.error("getCoupons error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch coupons",
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    return res.json({
      status: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("createCoupon error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to create coupon",
    });
  }
};

const seedCoupons = async (req, res) => {
  try {
    await Coupon.deleteMany({});
    const coupons = [
      {
        code: "FLYHIGH",
        type: "flight",
        discountType: "percentage",
        discountValue: 10,
        description: "Get 10% OFF on all flight bookings up to ₹1500",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
      {
        code: "FLYSAFE",
        type: "flight",
        discountType: "fixed",
        discountValue: 500,
        description: "Flat ₹500 OFF on your first flight",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
      {
        code: "TRAINSAVE",
        type: "train",
        discountType: "percentage",
        discountValue: 5,
        description: "Save 5% on train bookings",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
      {
        code: "HOTELSTAY",
        type: "hotel",
        discountType: "percentage",
        discountValue: 15,
        description: "15% OFF on luxury hotel stays",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
      {
        code: "BUSGO",
        type: "bus",
        discountType: "fixed",
        discountValue: 100,
        description: "Flat ₹100 OFF on intercity bus travel",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
      {
        code: "YATRALO500",
        type: "common",
        discountType: "fixed",
        discountValue: 500,
        description: "Flat ₹500 OFF on any booking above ₹5000",
        expiryDate: new Date("2026-12-31"),
        status: "active",
      },
    ];
    await Coupon.insertMany(coupons);
    return res.json({ status: true, message: "Coupons seeded successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  seedCoupons,
};
