const express = require('express');
const sendMailController = require('../Controllers/sendMailController');
const router = express.Router();

// Route for sending email
router.post('/', sendMailController.sendEmail);

// Route for sending OTP
router.post('/sendOtp', sendMailController.sendOtp);

// Route for verifying OTP
router.post('/verifyOtp', sendMailController.verifyOtp);

module.exports = router;
