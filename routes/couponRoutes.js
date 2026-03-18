const express = require("express");
const CouponController = require("../controllers/CouponController");

const router = express.Router();

router.get("/", CouponController.getCoupons);
router.post("/", CouponController.createCoupon);
router.post("/seed", CouponController.seedCoupons);

module.exports = router;
