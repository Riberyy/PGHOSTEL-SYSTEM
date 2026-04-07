const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyPayments, payRent, getOwnerPayments } = require('../controllers/paymentComplaintController');

router.get('/my',          protect, authorize('student'), getMyPayments);
router.put('/:id/pay',     protect, authorize('student'), payRent);
router.get('/owner',       protect, authorize('owner'),   getOwnerPayments);

module.exports = router;
