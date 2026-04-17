const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyPayments, payRent, getOwnerPayments, sendWarningEmail } = require('../controllers/paymentComplaintController');

router.get('/my',        protect, getMyPayments);
router.put('/:id/pay',   protect, payRent);
router.get('/owner',     protect, authorize('owner'), getOwnerPayments);
router.post('/send-warning', protect, authorize('owner'), sendWarningEmail);

module.exports = router;