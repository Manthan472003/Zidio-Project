const express = require('express');
const sendMailController = require('../Controllers/sendMailController');
const router = express.Router();

router.post('/', sendMailController.sendEmail);

router.post('/sendOtp', sendMailController.sendOtp);

router.post('/verifyOtp', sendMailController.verifyOtp);

module.exports = router;
