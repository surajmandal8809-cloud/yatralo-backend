const PaymentController = require('../controllers/PaymentController');
const express = require('express');
const router = express.Router();
const { verifyToken } = require("../services/jwt");

router.post('/create', verifyToken, PaymentController.createPayment);

module.exports = router;